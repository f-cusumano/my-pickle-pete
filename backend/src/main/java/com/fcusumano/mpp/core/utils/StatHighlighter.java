package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.utils.bo.StatHighlights;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.Iterator;
import java.util.Map;
import java.util.NavigableSet;
import java.util.Set;
import java.util.TreeSet;

/**
 * Regola di evidenziazione della tabella dei set, applicata a una colonna:
 * <ul>
 *     <li>se il valore più alto compare due o più volte si evidenziano solo le sue occorrenze;</li>
 *     <li>se compare una volta sola si aggiungono tutte le occorrenze del secondo valore più alto;</li>
 *     <li>specularmente per i valori più bassi.</li>
 * </ul>
 * Lo 0 è un valore valido e sempre il più basso: un valore uguale al minimo non è mai "di picco" (e viceversa),
 * e una colonna con un solo valore non evidenzia nulla.
 */
public final class StatHighlighter {

    private StatHighlighter() {}


    public static StatHighlights highlight(Map<Stat, BigDecimal> values) {
        final NavigableSet<BigDecimal> distinctValues = new TreeSet<>(Comparator.naturalOrder()); //compareTo: 5 e 5.00 coincidono
        distinctValues.addAll(values.values());
        if (distinctValues.size() < 2) return StatHighlights.none();
        final Set<Stat> best = extremes(values, distinctValues.descendingSet(), distinctValues.first());
        final Set<Stat> worst = extremes(values, distinctValues, distinctValues.last());
        return new StatHighlights(best, worst);
    }

    /** Statistiche con il primo valore (e, se unico, con il secondo) nell'ordine dato, escluso il valore opposto. */
    private static Set<Stat> extremes(Map<Stat, BigDecimal> values, NavigableSet<BigDecimal> orderedValues, BigDecimal oppositeValue) {
        final Iterator<BigDecimal> iterator = orderedValues.iterator();
        final BigDecimal first = iterator.next();
        final Set<Stat> extremes = statsWith(values, first);
        if (extremes.size() == 1 && iterator.hasNext()) {
            final BigDecimal second = iterator.next();
            if (second.compareTo(oppositeValue) != 0) extremes.addAll(statsWith(values, second));
        }
        return extremes;
    }

    private static Set<Stat> statsWith(Map<Stat, BigDecimal> values, BigDecimal value) {
        final Set<Stat> stats = EnumSet.noneOf(Stat.class);
        values.forEach((stat, statValue) -> {
            if (statValue.compareTo(value) == 0) stats.add(stat);
        });
        return stats;
    }
}
