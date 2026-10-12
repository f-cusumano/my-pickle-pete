package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.enums.Stat;

import java.math.BigDecimal;

/** Riga della tabella di un set: valore attuale e valore top di una caratteristica, con le evidenziazioni. */
public record StatComparison(Stat stat, BigDecimal current, BigDecimal top, Highlight currentHighlight, Highlight topHighlight) {
}
