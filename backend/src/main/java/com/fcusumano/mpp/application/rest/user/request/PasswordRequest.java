package com.fcusumano.mpp.application.rest.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import static com.fcusumano.mpp.core.Constants.MAX_PASSWORD_LENGTH;
import static com.fcusumano.mpp.core.Constants.MIN_PASSWORD_LENGTH;

/** Cambio password: serve quella attuale. */
public record PasswordRequest(@NotBlank(message = "Current password must be specified.") String currentPassword,
                              @NotBlank(message = "New password must be specified.")
                              @Size(min = MIN_PASSWORD_LENGTH, max = MAX_PASSWORD_LENGTH, message = "Password must have 8 to 72 characters.")
                              String newPassword) {
}
