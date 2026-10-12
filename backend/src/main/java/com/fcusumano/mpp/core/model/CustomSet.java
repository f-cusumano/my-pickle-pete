package com.fcusumano.mpp.core.model;

import java.util.List;

/** Set custom salvato: i pezzi sono riferimenti agli item censiti. */
public record CustomSet(long id, String name, List<Long> itemIds) {

    public CustomSet {
        itemIds = itemIds == null ? List.of() : List.copyOf(itemIds);
    }
}
