package com.fcusumano.mpp.infrastructure.repository;

/** Conversione tra enum di dominio e colonne VARCHAR che ne contengono il nome. */
final class EnumColumns {

    private EnumColumns() {}


    static String name(Enum<?> value) {
        return value == null ? null : value.name();
    }

    static <E extends Enum<E>> E valueOf(Class<E> type, String name) {
        return name == null ? null : Enum.valueOf(type, name);
    }
}
