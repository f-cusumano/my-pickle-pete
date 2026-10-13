package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;

/**
 * Riga della tabella di un set: valore attuale e valore top di una caratteristica (in una unità), con le evidenziazioni.
 * {@code weaponCurrent} e {@code weaponTop} sono il contributo dell'arma scelta, a parte (null se l'arma non porta
 * la caratteristica); le evidenziazioni tengono conto del totale. Nelle righe proprie dell'arma i valori sono quelli
 * dell'arma e non c'è evidenziazione.
 */
public record StatComparison(StatKey key, BigDecimal current, BigDecimal top, BigDecimal weaponCurrent, BigDecimal weaponTop,
                             Highlight currentHighlight, Highlight topHighlight) {
}
