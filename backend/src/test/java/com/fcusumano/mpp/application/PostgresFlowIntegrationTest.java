package com.fcusumano.mpp.application;

import com.fcusumano.mpp.TestData;
import com.fcusumano.mpp.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** L'applicazione delle release su un PostgreSQL vero: schema Liquibase, censimento, progressi (MERGE) e Custom Set. */
@SpringBootTest(properties = {"spring.jooq.sql-dialect=POSTGRES", "mpp.frontend.dist-path=target/no-frontend"})
@Testcontainers
class PostgresFlowIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private WebApplicationContext context;


    @Test
    void censusProgressAndCustomSetOnPostgres() throws Exception {
        final MockMvc mockMvc = TestUsers.censusByAdminOthersByOwner(context);
        final long hat = TestData.populate(mockMvc);

        mockMvc.perform(get("/api/item").param("id", String.valueOf(hat)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rarity").value("EPIC"))
                .andExpect(jsonPath("$.level").value(25));
        mockMvc.perform(get("/api/item/list").param("sortOrder", "ARMOR_SET")).andExpect(jsonPath("$", hasSize(3)));
        mockMvc.perform(get("/api/custom-set/list"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value(TestData.CUSTOM_SET_NAME));
        //I nomi restano unici senza distinzione di maiuscole anche su PostgreSQL
        mockMvc.perform(post("/api/custom-set").contentType(MediaType.APPLICATION_JSON).content("{\"name\": \"FORTUNA\", \"itemIds\": []}"))
                .andExpect(status().isConflict());
    }
}
