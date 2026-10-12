package com.fcusumano.mpp.infrastructure.exception;

/** Base delle eccezioni di dominio: messaggio con i valori in gioco e codice di errore applicativo (R24). */
public abstract class BaseMppException extends RuntimeException {

    private final InternalErrorCode internalErrorCode;


    protected BaseMppException(String message) {
        this(InternalErrorCode.GENERIC, message);
    }

    protected BaseMppException(InternalErrorCode internalErrorCode, String message) {
        super(message);
        this.internalErrorCode = internalErrorCode;
    }

    protected BaseMppException(String pattern, Object... args) {
        this(InternalErrorCode.GENERIC, pattern, args);
    }

    protected BaseMppException(InternalErrorCode internalErrorCode, String pattern, Object... args) {
        this(internalErrorCode, String.format(pattern, args));
    }

    public InternalErrorCode internalErrorCode() {
        return internalErrorCode;
    }
}
