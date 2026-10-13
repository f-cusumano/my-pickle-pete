package com.fcusumano.mpp.infrastructure.exception;

/** Codici di errore applicativi restituiti al client (il frontend li traduce). */
public enum InternalErrorCode {
    GENERIC,
    VALIDATION_FAILED,
    ITEM_NOT_FOUND,
    ITEM_NAME_ALREADY_EXISTS,
    ARMOR_SLOT_ALREADY_TAKEN,
    LEVEL_OUT_OF_RANGE,
    CUSTOM_SET_NOT_FOUND,
    CUSTOM_SET_NAME_ALREADY_EXISTS,
    CUSTOM_SET_INVALID_PIECES,
    CUSTOM_SET_INVALID_WEAPON,
    CUSTOM_SET_INVALID_ABILITY
}
