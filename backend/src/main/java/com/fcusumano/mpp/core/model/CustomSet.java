package com.fcusumano.mpp.core.model;

import java.util.List;

/** Set custom salvato: i pezzi, l'arma e l'abilità (null se nessuna) sono riferimenti agli item censiti. */
public record CustomSet(long id, String name, List<Long> itemIds, Long weaponId, Long abilityId) {

    public CustomSet {
        itemIds = itemIds == null ? List.of() : List.copyOf(itemIds);
    }
}
