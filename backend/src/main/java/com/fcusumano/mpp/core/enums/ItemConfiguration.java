package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;
import java.util.SortedMap;
import java.util.function.Function;
import java.util.function.ToIntFunction;

/** Configurazione con cui si leggono le caratteristiche di un item: quella effettiva dell'inventario o quella top. */
public enum ItemConfiguration {
    CURRENT(Item::currentStats, Item::baseStatValue),
    TOP(Item::topStats, Item::topBaseStatValue);

    private final Function<Item, SortedMap<StatKey, BigDecimal>> stats;
    private final ToIntFunction<Item> baseStatValue;


    ItemConfiguration(Function<Item, SortedMap<StatKey, BigDecimal>> stats, ToIntFunction<Item> baseStatValue) {
        this.stats = stats;
        this.baseStatValue = baseStatValue;
    }

    /** Potenziamenti sbloccati, senza la caratteristica base del livello. */
    public SortedMap<StatKey, BigDecimal> stats(Item item) {
        return stats.apply(item);
    }

    /** Danno/HP dovuti al livello. */
    public int baseStatValue(Item item) {
        return baseStatValue.applyAsInt(item);
    }
}
