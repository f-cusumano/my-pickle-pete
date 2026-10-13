package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.core.utils.bo.LevelStats;

/** Danno (%) e HP (valore) dovuti al livello dei pezzi di un set e dell'arma, attuali e top. */
public record LevelStatsResponse(int damageNow, int damageTop, int hpNow, int hpTop) {

    public LevelStatsResponse(LevelStats levelStats) {
        this(levelStats.currentDamage(), levelStats.topDamage(), levelStats.currentHp(), levelStats.topHp());
    }
}
