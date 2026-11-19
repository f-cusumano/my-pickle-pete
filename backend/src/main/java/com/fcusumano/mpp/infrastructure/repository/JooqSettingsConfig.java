package com.fcusumano.mpp.infrastructure.repository;

import org.jooq.conf.RenderQuotedNames;
import org.springframework.boot.jooq.autoconfigure.DefaultConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Nomi di tabelle e colonne senza virgolette: le classi jOOQ sono generate da H2 (maiuscolo), PostgreSQL usa il
 * minuscolo; senza virgolette ogni database applica il proprio e lo stesso codice va su entrambi.
 */
@Configuration
public class JooqSettingsConfig {

    @Bean
    public DefaultConfigurationCustomizer unquotedNames() {
        return configuration -> configuration.settings().withRenderQuotedNames(RenderQuotedNames.NEVER);
    }
}
