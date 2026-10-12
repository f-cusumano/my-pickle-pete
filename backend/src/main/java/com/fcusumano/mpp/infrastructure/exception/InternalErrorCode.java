package com.fcusumano.mpp.infrastructure.exception;

/** Codici di errore applicativi restituiti al client (il frontend li traduce). */
public enum InternalErrorCode {
    GENERIC,
    VALIDATION_FAILED,
    ITEM_NOT_FOUND,
    ITEM_NAME_ALREADY_EXISTS,
    ARMOR_SLOT_ALREADY_TAKEN,
    MAX_RARITY_REACHED,
    LEVEL_OUT_OF_RANGE,
    IMAGE_NOT_FOUND,
    IMAGE_NOT_VALID,
    IMAGE_TOO_LARGE
}
