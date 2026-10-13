package com.fcusumano.mpp.core.model;

import java.util.List;

/**
 * Dati di un set custom scelti dall'utente: nome, item indossati (al massimo uno per slot di armatura)
 * e arma facoltativa (null se nessuna).
 */
public record CustomSetDefinition(String name, List<Long> itemIds, Long weaponId) {

    public CustomSetDefinition {
        name = name == null ? null : name.strip();
        itemIds = itemIds == null ? List.of() : List.copyOf(itemIds);
    }
}
