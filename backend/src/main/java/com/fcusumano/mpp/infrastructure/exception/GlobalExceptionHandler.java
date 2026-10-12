package com.fcusumano.mpp.infrastructure.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.GENERIC;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.VALIDATION_FAILED;

/** Unico punto di traduzione delle eccezioni in risposte HTTP (R24). */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String INCORRECT_REQUEST = "incorrectRequest";


    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> badRequest(BadRequestException exception) {
        return respond(HttpStatus.BAD_REQUEST, INCORRECT_REQUEST, exception);
    }

    @ExceptionHandler(ObjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ObjectNotFoundException exception) {
        return respond(HttpStatus.NOT_FOUND, "unregisteredObject", exception);
    }

    @ExceptionHandler(ObjectAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> alreadyExists(ObjectAlreadyExistsException exception) {
        return respond(HttpStatus.CONFLICT, "alreadyRegisteredObject", exception);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidBody(MethodArgumentNotValidException exception) {
        final List<String> messages = exception.getBindingResult().getAllErrors().stream()
                .map(error -> error instanceof FieldError fieldError
                              ? "%s: %s".formatted(fieldError.getField(), fieldError.getDefaultMessage())
                              : error.getDefaultMessage())
                .toList();
        return validationFailure(messages);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> invalidParameters(HandlerMethodValidationException exception) {
        return validationFailure(exception.getAllErrors().stream().map(error -> error.getDefaultMessage()).toList());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> constraintViolation(ConstraintViolationException exception) {
        return validationFailure(exception.getConstraintViolations().stream().map(ConstraintViolation::getMessage).toList());
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> malformedParameters(Exception exception) {
        return validationFailure(List.of(exception.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> unexpected(RuntimeException exception) {
        log.error("Unexpected error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("internalError", GENERIC, "Unexpected error, see the server log."));
    }

    private ResponseEntity<ErrorResponse> validationFailure(List<String> messages) {
        log.warn("Validation failed: {}", messages);
        return ResponseEntity.badRequest().body(ErrorResponse.of(INCORRECT_REQUEST, VALIDATION_FAILED, messages));
    }

    private static ResponseEntity<ErrorResponse> respond(HttpStatus status, String key, BaseMppException exception) {
        log.warn("{} ({}): {}", key, exception.internalErrorCode(), exception.getMessage());
        return ResponseEntity.status(status).body(ErrorResponse.of(key, exception.internalErrorCode(), exception.getMessage()));
    }
}
