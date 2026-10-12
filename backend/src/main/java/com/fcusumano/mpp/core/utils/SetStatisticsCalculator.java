package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.utils.bo.StatComparison;
import com.fcusumano.mpp.core.utils.bo.StatHighlights;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_BONUS_THRESHOLD;

/** Calcoli sulle caratteristiche di un gruppo di armature indossate insieme (Full Set e, in futuro, Custom Set). */
public final class SetStatisticsCalculator {

    private SetStatisticsCalculator() {}


    /** Una riga per ogni caratteristica del gioco, nell'ordine fisso, con le evidenziazioni di ciascuna colonna. */
    public static List<StatComparison> compare(Collection<Item> pieces) {
        final Map<Stat, BigDecimal> current = StatUtils.sum(pieces.stream().map(Item::currentStats).toList());
        final Map<Stat, BigDecimal> top = StatUtils.sum(pieces.stream().map(Item::topStats).toList());
        final StatHighlights currentHighlights = StatHighlighter.highlight(current);
        final StatHighlights topHighlights = StatHighlighter.highlight(top);
        final List<StatComparison> rows = new ArrayList<>(Stat.values().length);
        for (Stat stat : Stat.values()) {
            rows.add(new StatComparison(stat, current.get(stat), top.get(stat), currentHighlights.highlight4(stat), topHighlights.highlight4(stat)));
        }
        return rows;
    }

    /** Il bonus del set si attiva indossando almeno 4 pezzi dello stesso set. */
    public static boolean bonusActive(int piecesOfSameSet) {
        return piecesOfSameSet >= ARMOR_SET_BONUS_THRESHOLD;
    }
}
