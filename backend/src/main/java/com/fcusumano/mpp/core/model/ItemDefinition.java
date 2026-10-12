package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;

import java.util.List;

/** Dati di censimento di un item: tutto ciò che non dipende dall'inventario (rarità e livello effettivi). */
public record ItemDefinition(String name, ItemType type, Specification specification, ArmorSet armorSet, List<RarityBonus> bonuses) {

    public ItemDefinition {
        name = name == null ? null : name.strip();
        bonuses = bonuses == null ? List.of() : List.copyOf(bonuses);
    }
}
