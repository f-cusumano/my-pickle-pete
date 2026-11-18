package com.fcusumano.mpp.application.rest.user.request;

import jakarta.validation.constraints.NotBlank;

/** Credenziali del login; {@code rememberMe} (facoltativo) emette il cookie che evita di rientrare a ogni sessione. */
public record LoginRequest(@NotBlank(message = "Nickname must be specified.") String nickname,
                           @NotBlank(message = "Password must be specified.") String password,
                           Boolean rememberMe) {

    public boolean rememberMeOrFalse() {
        return Boolean.TRUE.equals(rememberMe);
    }
}
