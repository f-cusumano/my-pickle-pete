package com.fcusumano.mpp.core.model;

import java.time.LocalDate;

/** Dati anagrafici di un'utenza, tutti facoltativi: i testi vuoti diventano null. */
public record UserProfile(String firstName, String lastName, LocalDate birthDate, String email) {

    public static final UserProfile EMPTY = new UserProfile(null, null, null, null);

    public UserProfile {
        firstName = normalize(firstName);
        lastName = normalize(lastName);
        email = normalize(email);
    }

    private static String normalize(String text) {
        return text == null || text.isBlank() ? null : text.strip();
    }
}
