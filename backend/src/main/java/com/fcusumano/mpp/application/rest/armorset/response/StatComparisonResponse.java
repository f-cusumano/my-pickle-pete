package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.utils.bo.Highlight;
import com.fcusumano.mpp.core.utils.bo.StatComparison;

import java.math.BigDecimal;
import java.util.List;

/** Riga della tabella di un set: caratteristica, unità, valori attuale e top con le evidenziazioni. */
public record StatComparisonResponse(Stat stat, StatUnit unit, BigDecimal current, BigDecimal top, Highlight currentHighlight, Highlight topHighlight) {

    public StatComparisonResponse(StatComparison comparison) {
        this(comparison.key().stat(), comparison.key().unit(), comparison.current(), comparison.top(),
             comparison.currentHighlight(), comparison.topHighlight());
    }

    public static List<StatComparisonResponse> of(List<StatComparison> comparisons) {
        return comparisons.stream().map(StatComparisonResponse::new).toList();
    }
}
