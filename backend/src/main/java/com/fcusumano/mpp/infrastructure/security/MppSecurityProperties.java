package com.fcusumano.mpp.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;

/**
 * Configurazione dell'accesso: chiave e durata del cookie "ricordami", password iniziali (nickname → password)
 * delle utenze create da Liquibase.
 */
@ConfigurationProperties("mpp.security")
public record MppSecurityProperties(String rememberMeKey, int rememberMeDays, Map<String, String> initialPasswords) {

    public MppSecurityProperties {
        initialPasswords = initialPasswords == null ? Map.of() : Map.copyOf(initialPasswords);
    }
}
