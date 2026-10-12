package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

/** Operazioni sulle mappe caratteristica → valore. */
public final class StatUtils {

    private StatUtils() {}


    /** Tutte le caratteristiche del gioco, nella loro unità predefinita, a zero. */
    public static SortedMap<StatKey, BigDecimal> zeroStats() {
        final SortedMap<StatKey, BigDecimal> stats = new TreeMap<>();
        for (Stat stat : Stat.values()) stats.put(StatKey.defaultOf(stat), BigDecimal.ZERO);
        return stats;
    }

    /**
     * Somma per caratteristica e unità: ci sono sempre tutte le caratteristiche nell'unità predefinita
     * (zero dove nessuno contribuisce) più quelle nell'altra unità solo se qualcuno le porta.
     */
    public static SortedMap<StatKey, BigDecimal> sum(Collection<? extends Map<StatKey, BigDecimal>> contributions) {
        final SortedMap<StatKey, BigDecimal> total = zeroStats();
        for (Map<StatKey, BigDecimal> contribution : contributions) { //Pochi elementi (pezzi di un set)
            contribution.forEach((key, value) -> total.merge(key, value, BigDecimal::add));
        }
        return total;
    }
}
