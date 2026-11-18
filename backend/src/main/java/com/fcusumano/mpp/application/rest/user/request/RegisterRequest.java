package com.fcusumano.mpp.application.rest.user.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import static com.fcusumano.mpp.core.Constants.MAX_NICKNAME_LENGTH;
import static com.fcusumano.mpp.core.Constants.MAX_PASSWORD_LENGTH;
import static com.fcusumano.mpp.core.Constants.MIN_NICKNAME_LENGTH;
import static com.fcusumano.mpp.core.Constants.MIN_PASSWORD_LENGTH;

/** Registrazione libera di un'utenza normale: nickname, password e dati anagrafici facoltativi. */
public record RegisterRequest(@NotBlank(message = "Nickname must be specified.")
                              @Size(min = MIN_NICKNAME_LENGTH, max = MAX_NICKNAME_LENGTH, message = "Nickname must have 3 to 30 characters.")
                              @Pattern(regexp = "[A-Za-z0-9._-]+", message = "Nickname allows only letters, digits, dot, dash and underscore.")
                              String nickname,
                              @NotBlank(message = "Password must be specified.")
                              @Size(min = MIN_PASSWORD_LENGTH, max = MAX_PASSWORD_LENGTH, message = "Password must have 8 to 72 characters.")
                              String password,
                              @Valid ProfileRequest profile) {

    public ProfileRequest profileOrEmpty() {
        return profile == null ? new ProfileRequest(null, null, null, null) : profile;
    }
}
