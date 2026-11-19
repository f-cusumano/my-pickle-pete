package com.fcusumano.mpp.infrastructure.porting;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Sorgente del porting: il file H2 di sviluppo (percorso senza estensione). */
@ConfigurationProperties("mpp.porting")
public record PortingProperties(String h2Path) {}
