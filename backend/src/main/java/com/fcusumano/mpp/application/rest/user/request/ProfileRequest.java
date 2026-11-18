package com.fcusumano.mpp.application.rest.user.request;

import com.fcusumano.mpp.core.model.UserProfile;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

import static com.fcusumano.mpp.core.Constants.MAX_EMAIL_LENGTH;
import static com.fcusumano.mpp.core.Constants.MAX_PERSON_NAME_LENGTH;

/** Dati anagrafici dell'utente, tutti facoltativi. */
public record ProfileRequest(@Size(max = MAX_PERSON_NAME_LENGTH, message = "First name allows at most 50 characters.") String firstName,
                             @Size(max = MAX_PERSON_NAME_LENGTH, message = "Last name allows at most 50 characters.") String lastName,
                             @Past(message = "Birth date must be in the past.") LocalDate birthDate,
                             @Email(message = "Email is not valid.")
                             @Size(max = MAX_EMAIL_LENGTH, message = "Email allows at most 100 characters.") String email) {

    public UserProfile toModel() {
        return new UserProfile(firstName, lastName, birthDate, email);
    }
}
