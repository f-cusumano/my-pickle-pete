package com.fcusumano.mpp.application.rest.user.response;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.core.model.User;

import java.time.LocalDate;

/** Utente autenticato con il ruolo (il frontend mostra le sezioni in base a questo) e i dati anagrafici. */
public record UserResponse(long id, String nickname, UserRole role, String firstName, String lastName, LocalDate birthDate, String email) {

    public UserResponse(User user) {
        this(user.id(), user.nickname(), user.role(), user.profile().firstName(), user.profile().lastName(), user.profile().birthDate(),
             user.profile().email());
    }
}
