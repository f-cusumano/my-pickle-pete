package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;

/** Riga della tabella di un set: valore attuale e valore top di una caratteristica (in una unità), con le evidenziazioni. */
public record StatComparison(StatKey key, BigDecimal current, BigDecimal top, Highlight currentHighlight, Highlight topHighlight) {
}
