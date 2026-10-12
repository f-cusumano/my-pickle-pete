package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.Item;

import java.util.List;

/**
 * Set custom (salvato o no) con i pezzi in ordine di slot, il bonus attivo (set con almeno 4 pezzi, null se nessuno)
 * e il confronto tra caratteristiche attuali e top.
 */
public record EvaluatedSet(Long id, String name, List<Item> pieces, ArmorSet bonusArmorSet, String bonusDescription, List<StatComparison> stats) {

    public EvaluatedSet {
        pieces = List.copyOf(pieces);
        stats = List.copyOf(stats);
    }

    @Override
    public String toString() {
        return "EvaluatedSet[id=%s, name=%s, pieces=%d, bonusArmorSet=%s]".formatted(id, name, pieces.size(), bonusArmorSet);
    }
}
