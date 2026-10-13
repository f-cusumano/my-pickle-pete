package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;

import java.util.List;

/**
 * Dati di censimento di un item: tutto ciò che non dipende dall'inventario (rarità e livello effettivi).
 * La descrizione (solo abilità) è testo libero sugli effetti, null se vuota.
 */
public record ItemDefinition(String name, ItemType type, Specification specification, ArmorSet armorSet, String description,
                             List<RarityBonus> bonuses) {

    public ItemDefinition {
        name = name == null ? null : name.strip();
        description = description == null || description.isBlank() ? null : description.strip();
        bonuses = bonuses == null ? List.of() : List.copyOf(bonuses);
    }
}
