package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;
import java.util.SortedMap;
import java.util.function.Function;

/** Configurazione con cui si leggono le caratteristiche di un item: quella effettiva dell'inventario o quella top. */
public enum ItemConfiguration {
    CURRENT(Item::currentStats),
    TOP(Item::topStats);

    private final Function<Item, SortedMap<StatKey, BigDecimal>> stats;


    ItemConfiguration(Function<Item, SortedMap<StatKey, BigDecimal>> stats) {
        this.stats = stats;
    }

    public SortedMap<StatKey, BigDecimal> stats(Item item) {
        return stats.apply(item);
    }
}
