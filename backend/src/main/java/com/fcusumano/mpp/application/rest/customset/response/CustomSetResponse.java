package com.fcusumano.mpp.application.rest.customset.response;

import com.fcusumano.mpp.application.rest.armorset.response.StatComparisonResponse;
import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.utils.bo.EvaluatedSet;

import java.util.List;

/**
 * Set custom (id e nome null se non salvato): pezzi in ordine di slot, bonus del set con almeno 4 pezzi (null se nessuno)
 * e tabella delle caratteristiche attuali e top con le evidenziazioni.
 */
public record CustomSetResponse(Long id, String name, ArmorSet bonusArmorSet, String bonusDescription, List<ItemResponse> pieces,
                                List<StatComparisonResponse> stats) {

    public CustomSetResponse(EvaluatedSet set) {
        this(set.id(), set.name(), set.bonusArmorSet(), set.bonusDescription(), ItemResponse.of(set.pieces()), StatComparisonResponse.of(set.stats()));
    }

    public static List<CustomSetResponse> of(List<EvaluatedSet> sets) {
        return sets.stream().map(CustomSetResponse::new).toList();
    }
}
