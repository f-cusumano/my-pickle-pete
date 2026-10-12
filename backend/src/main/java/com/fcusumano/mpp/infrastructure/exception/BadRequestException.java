package com.fcusumano.mpp.infrastructure.exception;

public class BadRequestException extends BaseMppException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(InternalErrorCode internalErrorCode, String message) {
        super(internalErrorCode, message);
    }

    public BadRequestException(String pattern, Object... args) {
        super(pattern, args);
    }

    public BadRequestException(InternalErrorCode internalErrorCode, String pattern, Object... args) {
        super(internalErrorCode, pattern, args);
    }
}
