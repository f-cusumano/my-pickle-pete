package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.utils.bo.FullSet;

import java.util.List;

/**
 * Set completo: pezzi in ordine di slot, Danno e HP dovuti al livello, tabella delle caratteristiche attuali e top
 * con le evidenziazioni e armi consigliate.
 */
public record FullSetResponse(ArmorSet armorSet, String bonusDescription, boolean bonusActive, List<ItemResponse> pieces,
                              LevelStatsResponse levelStats, List<StatComparisonResponse> stats, WeaponAdviceResponse weaponAdvice) {

    public FullSetResponse(FullSet fullSet) {
        this(fullSet.armorSet(), fullSet.bonusDescription(), fullSet.bonusActive(), ItemResponse.of(fullSet.pieces()),
             new LevelStatsResponse(fullSet.statistics().levelStats()), StatComparisonResponse.of(fullSet.statistics().rows()),
             new WeaponAdviceResponse(fullSet.statistics()));
    }
}
