package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.utils.bo.Highlight;
import com.fcusumano.mpp.core.utils.bo.StatComparison;

import java.math.BigDecimal;
import java.util.List;

/**
 * Riga della tabella di un set: caratteristica, unità, valori attuale e top con le evidenziazioni.
 * {@code weaponCurrent} e {@code weaponTop} sono il contributo dell'arma (null se non porta la caratteristica);
 * {@code own} indica una caratteristica propria dell'arma, mostrata in fondo con i soli valori dell'arma.
 */
public record StatComparisonResponse(Stat stat, StatUnit unit, boolean own, BigDecimal current, BigDecimal top,
                                     BigDecimal weaponCurrent, BigDecimal weaponTop, Highlight currentHighlight, Highlight topHighlight) {

    public StatComparisonResponse(StatComparison comparison) {
        this(comparison.key().stat(), comparison.key().unit(), comparison.key().own(), comparison.current(), comparison.top(),
             comparison.weaponCurrent(), comparison.weaponTop(), comparison.currentHighlight(), comparison.topHighlight());
    }

    public static List<StatComparisonResponse> of(List<StatComparison> comparisons) {
        return comparisons.stream().map(StatComparisonResponse::new).toList();
    }
}
