package com.fcusumano.mpp.infrastructure.porting;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Profilo porting: copia il file H2 indicato nel database dell'applicazione (PostgreSQL), poi l'avvio termina. */
@Component
@Profile("porting")
@Order(0) //Prima delle password iniziali: le utenze arrivano dalla sorgente con le loro password
@EnableConfigurationProperties(PortingProperties.class)
public class PortingRunner implements ApplicationRunner {

    private final DSLContext target;
    private final PortingProperties properties;


    public PortingRunner(DSLContext target, PortingProperties properties) {
        this.target = target;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) throws SQLException {
        try (Connection h2 = DriverManager.getConnection("jdbc:h2:file:" + properties.h2Path() + ";ACCESS_MODE_DATA=r", "sa", "")) {
            new DatabasePorting().port(DSL.using(h2, SQLDialect.H2), target);
        }
    }
}
