package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.Stat;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.EnumMap;
import java.util.Map;

/** Operazioni sulle mappe caratteristica → valore. */
public final class StatUtils {

    private StatUtils() {}


    /** Tutte le caratteristiche del gioco a zero. */
    public static Map<Stat, BigDecimal> zeroStats() {
        final Map<Stat, BigDecimal> stats = new EnumMap<>(Stat.class);
        for (Stat stat : Stat.values()) stats.put(stat, BigDecimal.ZERO);
        return stats;
    }

    /** Somma per caratteristica, con tutte le caratteristiche presenti (zero dove nessuno contribuisce). */
    public static Map<Stat, BigDecimal> sum(Collection<Map<Stat, BigDecimal>> contributions) {
        final Map<Stat, BigDecimal> total = zeroStats();
        for (Map<Stat, BigDecimal> contribution : contributions) { //Pochi elementi (pezzi di un set)
            contribution.forEach((stat, value) -> total.merge(stat, value, BigDecimal::add));
        }
        return total;
    }
}
