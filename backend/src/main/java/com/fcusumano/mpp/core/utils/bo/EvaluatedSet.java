package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.Item;

import java.util.List;

/**
 * Set custom (salvato o no) con i pezzi in ordine di slot, l'arma e l'abilità scelte (null se nessuna), il bonus attivo
 * (set con almeno 4 pezzi, null se nessuno), il confronto tra caratteristiche attuali e top e i tipi di arma consigliati.
 */
public record EvaluatedSet(Long id, String name, List<Item> pieces, Item weapon, Item ability, ArmorSet bonusArmorSet, String bonusDescription,
                           SetStatistics statistics) {

    public EvaluatedSet {
        pieces = List.copyOf(pieces);
    }

    @Override
    public String toString() {
        return "EvaluatedSet[id=%s, name=%s, pieces=%d, weapon=%s, ability=%s, bonusArmorSet=%s]".formatted(
                id, name, pieces.size(), weapon == null ? null : weapon.id(), ability == null ? null : ability.id(), bonusArmorSet);
    }
}
