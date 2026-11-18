package com.fcusumano.mpp;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/** Utenze create da Liquibase su ogni H2 in memoria (id 1 e 2) e MockMvc che le usa con il token CSRF. */
public final class TestUsers {

    public static final MppUserPrincipal ADMIN = new MppUserPrincipal(1, "admin", null, UserRole.ADMIN);
    public static final MppUserPrincipal OWNER = new MppUserPrincipal(2, "francesco", null, UserRole.USER);


    private TestUsers() {}


    public static RequestPostProcessor as(MppUserPrincipal principal) {
        return request -> csrf().postProcessRequest(user(principal).postProcessRequest(request));
    }

    /**
     * MockMvc per i flussi completi: il censimento (scritture su /api/item e /api/armor-set) lo fa l'ADMIN, tutto il resto
     * l'utente personale. I divieti tra ruoli hanno test propri.
     */
    public static MockMvc censusByAdminOthersByOwner(WebApplicationContext context) {
        return MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .defaultRequest(get("/").with(request -> as(isCensus(request.getMethod(), request.getRequestURI()) ? ADMIN : OWNER)
                        .postProcessRequest(request)))
                .build();
    }

    private static boolean isCensus(String method, String uri) {
        if (HttpMethod.GET.matches(method)) return false;
        return uri.equals("/api/item") || uri.equals("/api/armor-set");
    }
}
