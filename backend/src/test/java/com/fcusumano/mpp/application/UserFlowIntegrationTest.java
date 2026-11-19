package com.fcusumano.mpp.application;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;

import static com.fcusumano.mpp.TestItems.allBonusesJson;
import static com.fcusumano.mpp.TestUsers.ADMIN;
import static com.fcusumano.mpp.TestUsers.OWNER;
import static com.fcusumano.mpp.TestUsers.as;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Utenze su H2 in memoria: login, registrazione, profilo, permessi dei ruoli e progressi separati per utente. */
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:mpp-user;DB_CLOSE_DELAY=-1", "mpp.frontend.dist-path=target/no-frontend",
                              "mpp.security.initial-passwords.admin=admin-secret"})
class UserFlowIntegrationTest {

    @Autowired
    private WebApplicationContext context;
    private MockMvc mockMvc;


    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    void apiNeedsLoginExceptAuthAndConstants() throws Exception {
        mockMvc.perform(get("/api/item/list")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/user")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/constants/game")).andExpect(status().isOk());
        //Senza token CSRF anche il login è rifiutato
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"nickname\": \"admin\", \"password\": \"admin-secret\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void initialPasswordLoginAndRememberMe() throws Exception {
        login("Admin", "admin-secret", true)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(cookie().exists("mpp-remember-me"));
        login("admin", "wrong-password", false)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_AUTHENTICATED"));
        //L'utente personale non ha ancora una password: non entra
        login("francesco", "any-password", false).andExpect(status().isUnauthorized());
        //"Ricordami" è facoltativo; un corpo illeggibile è una richiesta errata, non un errore interno
        postJson("/api/auth/login", "{\"nickname\": \"admin\", \"password\": \"admin-secret\"}").andExpect(status().isOk());
        postJson("/api/auth/login", "{\"nickname\": ").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void logoutIssuesANewCsrfToken() throws Exception {
        //Senza un token nuovo il login successivo sarebbe rifiutato (403) e riuscirebbe solo al secondo tentativo
        final MvcResult logout = mockMvc.perform(post("/api/auth/logout").with(as(OWNER))).andExpect(status().isOk()).andReturn();
        assertThat(lastCsrfCookie(logout)).isNotBlank();
    }

    @Test
    void registerProfileAndPassword() throws Exception {
        final MvcResult result = postJson("/api/auth/register", """
                {"nickname": "luigi", "password": "luigi-secret", "profile": {"firstName": " Luigi ", "birthDate": "1990-05-01"}}""")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.firstName").value("Luigi"))
                .andExpect(jsonPath("$.lastName").doesNotExist())
                .andReturn();
        final MppUserPrincipal luigi = new MppUserPrincipal(id(result), "luigi", null, UserRole.USER);

        postJson("/api/auth/register", "{\"nickname\": \"FRANCESCO\", \"password\": \"another-secret\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("USER_NICKNAME_ALREADY_EXISTS"));
        postJson("/api/auth/register", "{\"nickname\": \"a b\", \"password\": \"short\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        mockMvc.perform(put("/api/user").with(as(luigi)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\": \"Luigi\", \"lastName\": \"Verdi\", \"email\": \"luigi@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("Verdi"))
                .andExpect(jsonPath("$.birthDate").doesNotExist());
        mockMvc.perform(put("/api/user/password").with(as(luigi)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"currentPassword\": \"wrong-secret\", \"newPassword\": \"luigi-secret-2\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("WRONG_PASSWORD"));
        mockMvc.perform(put("/api/user/password").with(as(luigi)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"currentPassword\": \"luigi-secret\", \"newPassword\": \"luigi-secret-2\"}"))
                .andExpect(status().isNoContent());
        login("luigi", "luigi-secret", false).andExpect(status().isUnauthorized());
        login("luigi", "luigi-secret-2", false).andExpect(status().isOk());
    }

    @Test
    void rolesAndProgressPerUser() throws Exception {
        final String hatJson = "{\"name\": \"Cappello del cowboy\", \"type\": \"ARMOR\", \"specification\": \"HAT\", \"armorSet\": \"COWBOY\", \"bonuses\": %s}"
                .formatted(allBonusesJson());
        //Il censimento è solo dell'ADMIN, progressi e set custom solo degli utenti
        mockMvc.perform(post("/api/item").with(as(OWNER)).contentType(MediaType.APPLICATION_JSON).content(hatJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        final long hatId = id(mockMvc.perform(post("/api/item").with(as(ADMIN)).contentType(MediaType.APPLICATION_JSON).content(hatJson))
                                      .andExpect(status().isCreated())
                                      .andReturn());
        mockMvc.perform(put("/api/item/rarity").with(as(ADMIN)).param("id", String.valueOf(hatId)).param("rarity", "RARE"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/custom-set/list").with(as(ADMIN))).andExpect(status().isForbidden());
        mockMvc.perform(put("/api/armor-set").with(as(OWNER)).param("armorSet", "COWBOY").contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bonusDescription\": \"x\"}"))
                .andExpect(status().isForbidden());

        //I progressi sono dell'utente: l'ADMIN e gli altri utenti vedono ancora Comune 1
        mockMvc.perform(put("/api/item/rarity").with(as(OWNER)).param("id", String.valueOf(hatId)).param("rarity", "RARE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rarity").value("RARE"));
        mockMvc.perform(put("/api/item/level").with(as(OWNER)).param("id", String.valueOf(hatId)).param("level", "25"))
                .andExpect(jsonPath("$.level").value(25));
        mockMvc.perform(get("/api/item").with(as(OWNER)).param("id", String.valueOf(hatId)))
                .andExpect(jsonPath("$.rarity").value("RARE"))
                .andExpect(jsonPath("$.level").value(25));
        mockMvc.perform(get("/api/item").with(as(ADMIN)).param("id", String.valueOf(hatId)))
                .andExpect(jsonPath("$.rarity").value("COMMON"))
                .andExpect(jsonPath("$.level").value(1));

        //Set custom separati: stesso nome per utenti diversi, invisibili agli altri
        final MppUserPrincipal other = new MppUserPrincipal(
                id(postJson("/api/auth/register", "{\"nickname\": \"mario\", \"password\": \"mario-secret\"}").andReturn()), "mario", null, UserRole.USER);
        final long ownerSet = id(mockMvc.perform(post("/api/custom-set").with(as(OWNER)).contentType(MediaType.APPLICATION_JSON)
                                                         .content("{\"name\": \"Cowboy\", \"itemIds\": [%d]}".formatted(hatId)))
                                         .andExpect(status().isCreated())
                                         .andReturn());
        mockMvc.perform(post("/api/custom-set").with(as(other)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\": \"cowboy\", \"itemIds\": [%d]}".formatted(hatId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pieces[0].rarity").value("COMMON"));
        mockMvc.perform(get("/api/custom-set").with(as(other)).param("id", String.valueOf(ownerSet)))
                .andExpect(status().isNotFound());
    }

    private ResultActions login(String nickname, String password, boolean rememberMe) throws Exception {
        return postJson("/api/auth/login", "{\"nickname\": \"%s\", \"password\": \"%s\", \"rememberMe\": %s}".formatted(nickname, password, rememberMe));
    }

    /** Ultimo cookie XSRF-TOKEN della risposta (il logout prima lo cancella): è quello che il browser tiene. */
    private static String lastCsrfCookie(MvcResult result) {
        return Arrays.stream(result.getResponse().getCookies())
                     .filter(c -> c.getName().equals("XSRF-TOKEN"))
                     .reduce((first, second) -> second)
                     .orElseThrow()
                     .getValue();
    }

    private ResultActions postJson(String path, String json) throws Exception {
        return mockMvc.perform(post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static long id(MvcResult result) throws Exception {
        return Long.parseLong(result.getResponse().getContentAsString().replaceAll("^\\{\"id\":(\\d+),.*$", "$1")); //L'id è il primo campo
    }
}
