package com.fcusumano.mpp.application.rest.customset.response;

import com.fcusumano.mpp.application.rest.armorset.response.LevelStatsResponse;
import com.fcusumano.mpp.application.rest.armorset.response.StatComparisonResponse;
import com.fcusumano.mpp.application.rest.armorset.response.WeaponAdviceResponse;
import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.utils.bo.EvaluatedSet;

import java.util.List;

/**
 * Set custom (id e nome null se non salvato): pezzi in ordine di slot, arma e abilità (null se nessuna), bonus del set
 * con almeno 4 pezzi (null se nessuno), Danno e HP dovuti al livello di pezzi e arma, tabella delle caratteristiche attuali
 * e top con le evidenziazioni, caratteristiche dell'abilità a parte e armi consigliate.
 */
public record CustomSetResponse(Long id, String name, ArmorSet bonusArmorSet, String bonusDescription, List<ItemResponse> pieces,
                                ItemResponse weapon, ItemResponse ability, LevelStatsResponse levelStats, List<StatComparisonResponse> stats,
                                List<StatComparisonResponse> abilityStats, WeaponAdviceResponse weaponAdvice) {

    public CustomSetResponse(EvaluatedSet set) {
        this(set.id(), set.name(), set.bonusArmorSet(), set.bonusDescription(), ItemResponse.of(set.pieces()),
             set.weapon() == null ? null : new ItemResponse(set.weapon()), set.ability() == null ? null : new ItemResponse(set.ability()),
             new LevelStatsResponse(set.statistics().levelStats()), StatComparisonResponse.of(set.statistics().rows()),
             StatComparisonResponse.of(set.statistics().abilityRows()), new WeaponAdviceResponse(set.statistics()));
    }

    public static List<CustomSetResponse> of(List<EvaluatedSet> sets) {
        return sets.stream().map(CustomSetResponse::new).toList();
    }
}
