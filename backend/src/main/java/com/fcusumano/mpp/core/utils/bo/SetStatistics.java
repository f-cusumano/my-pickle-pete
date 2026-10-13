package com.fcusumano.mpp.core.utils.bo;

import java.util.List;

/**
 * Tabella delle caratteristiche di un set, Danno e HP dovuti al livello e tipi di arma consigliati e sconsigliati,
 * con i valori attuali e top.
 */
public record SetStatistics(List<StatComparison> rows, LevelStats levelStats, WeaponAdvice currentAdvice, WeaponAdvice topAdvice) {

    public SetStatistics {
        rows = List.copyOf(rows);
    }
}
