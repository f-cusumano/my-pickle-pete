package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import com.fcusumano.mpp.core.utils.bo.StatComparison;
import com.fcusumano.mpp.core.utils.bo.StatHighlights;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeSet;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_BONUS_THRESHOLD;

/** Calcoli sulle caratteristiche di un gruppo di armature indossate insieme (Full Set e, in futuro, Custom Set). */
public final class SetStatisticsCalculator {

    private SetStatisticsCalculator() {}


    /**
     * Una riga per ogni caratteristica del gioco nell'unità predefinita, più una riga per ogni caratteristica
     * portata da qualche pezzo nell'altra unità; ordine fisso, con le evidenziazioni di ciascuna colonna.
     */
    public static List<StatComparison> compare(Collection<Item> pieces) {
        final SortedMap<StatKey, BigDecimal> current = complete(StatUtils.sum(pieces.stream().map(Item::currentStats).toList()), pieces);
        final SortedMap<StatKey, BigDecimal> top = complete(StatUtils.sum(pieces.stream().map(Item::topStats).toList()), pieces);
        final StatHighlights currentHighlights = StatHighlighter.highlight(current);
        final StatHighlights topHighlights = StatHighlighter.highlight(top);
        final List<StatComparison> rows = new ArrayList<>(top.size());
        for (StatKey key : top.keySet()) {
            rows.add(new StatComparison(key, current.get(key), top.get(key), currentHighlights.highlight4(key), topHighlights.highlight4(key)));
        }
        return rows;
    }

    /** Stesse righe nelle due colonne: un potenziamento non ancora sbloccato vale 0 nella colonna attuale. */
    private static SortedMap<StatKey, BigDecimal> complete(SortedMap<StatKey, BigDecimal> stats, Collection<Item> pieces) {
        final TreeSet<StatKey> keys = new TreeSet<>(stats.keySet());
        pieces.forEach(piece -> piece.bonuses().forEach(bonus -> keys.add(bonus.key())));
        keys.forEach(key -> stats.putIfAbsent(key, BigDecimal.ZERO));
        return stats;
    }

    /** Il bonus del set si attiva indossando almeno 4 pezzi dello stesso set. */
    public static boolean bonusActive(int piecesOfSameSet) {
        return piecesOfSameSet >= ARMOR_SET_BONUS_THRESHOLD;
    }
}
