package com.fcusumano.mpp.application.rest.customset.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_PIECES;

/** Pezzi e arma facoltativa di un set non ancora salvato, da valutare. */
public record CustomSetPiecesRequest(@Size(max = ARMOR_SET_PIECES, message = "A custom set has at most 5 pieces.") List<@NotNull Long> itemIds,
                                     Long weaponId) {

    public List<Long> itemIdsOrEmpty() {
        return itemIds == null ? List.of() : itemIds;
    }
}
