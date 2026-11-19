package com.fcusumano.mpp.infrastructure.porting;

import com.fcusumano.mpp.TestData;
import com.fcusumano.mpp.TestUsers;
import liquibase.integration.spring.SpringLiquibase;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.Table;
import org.jooq.conf.RenderQuotedNames;
import org.jooq.conf.Settings;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import javax.sql.DataSource;
import java.util.Map;

import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ARMOR_SET;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER_ITEM;

/** Porting dal database di sviluppo (H2, qui in memoria) a un PostgreSQL appena creato da Liquibase. */
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:mpp-porting;DB_CLOSE_DELAY=-1", "mpp.frontend.dist-path=target/no-frontend",
                              "mpp.security.initial-passwords.francesco=owner-secret"})
@Testcontainers
class DatabasePortingIntegrationTest {

    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private DSLContext h2;


    @Test
    void copiesEverythingIntoANewPostgres() throws Exception {
        TestData.populate(TestUsers.censusByAdminOthersByOwner(context));
        final DSLContext postgres = newPostgres();

        final Map<String, Integer> copied = new DatabasePorting().port(h2, postgres);

        copied.keySet().forEach(name -> {
            final Table<?> table = DSL.table(DSL.name(name));
            Assertions.assertEquals(h2.fetchCount(table), postgres.fetchCount(table), name);
        });
        Assertions.assertEquals(1, copied.get(MPP_USER_ITEM.getName())); //Solo il cappello ha progressi
        Assertions.assertEquals(passwordOf(h2), passwordOf(postgres)); //Si entra con la stessa password
        Assertions.assertEquals("Più veloce sotto il 30% di HP",
                                postgres.select(MPP_ARMOR_SET.BONUS_DESCRIPTION).from(MPP_ARMOR_SET).where(MPP_ARMOR_SET.CODE.eq("COWBOY")).fetchOne(0));
        //Le sequenze ripartono dopo gli id copiati
        final long maxUserId = postgres.select(DSL.max(MPP_USER.ID)).from(MPP_USER).fetchOne(0, Long.class);
        final long newUserId = postgres.insertInto(MPP_USER, MPP_USER.NICKNAME, MPP_USER.ROLE).values("nuovo", "USER").returning(MPP_USER.ID).fetchOne(MPP_USER.ID);
        Assertions.assertTrue(newUserId > maxUserId);
        //Una seconda volta no: il database non è più nuovo
        Assertions.assertThrows(IllegalStateException.class, () -> new DatabasePorting().port(h2, postgres));
    }

    /** Come all'avvio del profilo prod: schema creato da Liquibase, nomi senza virgolette. */
    private static DSLContext newPostgres() throws Exception {
        final DataSource dataSource = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        final SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource);
        liquibase.setChangeLog("classpath:db/changelog/master.xml");
        liquibase.setResourceLoader(new DefaultResourceLoader());
        liquibase.afterPropertiesSet();
        return DSL.using(dataSource, SQLDialect.POSTGRES, new Settings().withRenderQuotedNames(RenderQuotedNames.NEVER));
    }

    private static String passwordOf(DSLContext dsl) {
        return dsl.select(MPP_USER.PASSWORD_HASH).from(MPP_USER).where(MPP_USER.NICKNAME.eq("francesco")).fetchOne(MPP_USER.PASSWORD_HASH);
    }
}
