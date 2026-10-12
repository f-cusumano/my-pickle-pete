package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.utils.bo.FullSet;

import java.util.List;

/** Set completo: pezzi in ordine di slot e tabella delle caratteristiche attuali e top con le evidenziazioni. */
public record FullSetResponse(ArmorSet armorSet, String bonusDescription, boolean bonusActive, List<ItemResponse> pieces, List<StatComparisonResponse> stats) {

    public FullSetResponse(FullSet fullSet) {
        this(fullSet.armorSet(), fullSet.bonusDescription(), fullSet.bonusActive(), ItemResponse.of(fullSet.pieces()), StatComparisonResponse.of(fullSet.stats()));
    }
}
