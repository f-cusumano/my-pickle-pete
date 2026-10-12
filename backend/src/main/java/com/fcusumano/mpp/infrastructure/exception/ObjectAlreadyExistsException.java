package com.fcusumano.mpp.infrastructure.exception;

public class ObjectAlreadyExistsException extends BaseMppException {

    public ObjectAlreadyExistsException(String message) {
        super(message);
    }

    public ObjectAlreadyExistsException(InternalErrorCode internalErrorCode, String message) {
        super(internalErrorCode, message);
    }

    public ObjectAlreadyExistsException(String pattern, Object... args) {
        super(pattern, args);
    }

    public ObjectAlreadyExistsException(InternalErrorCode internalErrorCode, String pattern, Object... args) {
        super(internalErrorCode, pattern, args);
    }
}
