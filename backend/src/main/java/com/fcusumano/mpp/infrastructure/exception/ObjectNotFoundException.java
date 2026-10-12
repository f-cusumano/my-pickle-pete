package com.fcusumano.mpp.infrastructure.exception;

public class ObjectNotFoundException extends BaseMppException {

    public ObjectNotFoundException(String message) {
        super(message);
    }

    public ObjectNotFoundException(InternalErrorCode internalErrorCode, String message) {
        super(internalErrorCode, message);
    }

    public ObjectNotFoundException(String pattern, Object... args) {
        super(pattern, args);
    }

    public ObjectNotFoundException(InternalErrorCode internalErrorCode, String pattern, Object... args) {
        super(internalErrorCode, pattern, args);
    }
}
