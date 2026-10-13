package com.fcusumano.mpp.core.model;

import java.util.List;

/**
 * Dati di un set custom scelti dall'utente: nome, item indossati (al massimo uno per slot di armatura)
 * arma e abilità facoltative (null se nessuna).
 */
public record CustomSetDefinition(String name, List<Long> itemIds, Long weaponId, Long abilityId) {

    public CustomSetDefinition {
        name = name == null ? null : name.strip();
        itemIds = itemIds == null ? List.of() : List.copyOf(itemIds);
    }
}
