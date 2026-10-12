package com.fcusumano.mpp.infrastructure.exception;

import java.util.List;

/** Corpo delle risposte di errore: chiave della categoria, codice applicativo e messaggi. */
public record ErrorResponse(String key, InternalErrorCode code, List<String> messages) {

    public static ErrorResponse of(String key, InternalErrorCode code, List<String> messages) {
        return new ErrorResponse(key, code, List.copyOf(messages));
    }

    public static ErrorResponse of(String key, InternalErrorCode code, String message) {
        return of(key, code, List.of(message));
    }
}
