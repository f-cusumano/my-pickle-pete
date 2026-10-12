package com.fcusumano.mpp;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.RarityBonus;

import java.math.BigDecimal;
import java.util.List;

/** Item di prova (dati inventati) condivisi dai test. */
public final class TestItems {

    private TestItems() {}


    public static Item armor(long id, String name, ArmorSet armorSet, Specification slot, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.ARMOR, slot, armorSet, rarity, level, List.of(bonuses), null);
    }

    public static Item weapon(long id, String name, Specification kind, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.WEAPON, kind, null, rarity, level, List.of(bonuses), null);
    }

    public static Item ability(long id, String name, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.ABILITY, null, null, rarity, level, List.of(bonuses), null);
    }

    public static RarityBonus bonus(Rarity rarity, Stat stat, String amount) {
        return RarityBonus.of(rarity, stat, new BigDecimal(amount));
    }
}
