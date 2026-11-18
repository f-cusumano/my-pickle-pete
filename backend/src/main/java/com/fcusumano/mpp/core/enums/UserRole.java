package com.fcusumano.mpp.core.enums;

/** Ruolo di un'utenza: l'ADMIN censisce i dati del gioco, lo USER salva i propri progressi e i propri set custom. */
public enum UserRole {
    ADMIN,
    USER;

    /** Nome del ruolo per Spring Security ({@code hasRole('ADMIN')} cerca {@code ROLE_ADMIN}). */
    public String authority() {
        return "ROLE_" + name();
    }
}
