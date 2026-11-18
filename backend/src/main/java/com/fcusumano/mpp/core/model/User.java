package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.UserRole;

/** Utenza registrata; la password è null finché non la imposta l'avvio (utenze create da Liquibase). */
public record User(long id, String nickname, String passwordHash, UserRole role, UserProfile profile) {

    public boolean canLogIn() {
        return passwordHash != null;
    }
}
