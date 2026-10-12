package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.Item;

import java.util.List;

/** Set di armatura completo con i pezzi censiti e il confronto tra caratteristiche attuali e top. */
public record FullSet(ArmorSet armorSet, String bonusDescription, boolean bonusActive, List<Item> pieces, List<StatComparison> stats) {

    public FullSet {
        pieces = List.copyOf(pieces);
        stats = List.copyOf(stats);
    }

    @Override
    public String toString() {
        return "FullSet[armorSet=%s, pieces=%d, bonusActive=%s]".formatted(armorSet, pieces.size(), bonusActive);
    }
}
