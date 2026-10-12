package com.fcusumano.mpp.core.enums;

import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.core.enums.ItemType.ARMOR;
import static com.fcusumano.mpp.core.enums.ItemType.WEAPON;
import static com.fcusumano.mpp.core.enums.Stat.DAMAGE;
import static com.fcusumano.mpp.core.enums.Stat.MAX_HP;

/**
 * Specifica di armi (categoria) e armature (slot), nell'ordine di visualizzazione di ciascuna tipologia.
 * Cappello e occhiali danno Danno, gli altri slot HP; le armi danno sempre Danno.
 */
public enum Specification {
    RANGED(WEAPON, DAMAGE),
    ELEMENTAL(WEAPON, DAMAGE),
    MECHANICAL(WEAPON, DAMAGE),
    MELEE(WEAPON, DAMAGE),
    HAT(ARMOR, DAMAGE),
    GLASSES(ARMOR, DAMAGE),
    CHEST(ARMOR, MAX_HP),
    BACK(ARMOR, MAX_HP),
    BOOTS(ARMOR, MAX_HP);

    private final ItemType itemType;
    private final Stat baseStat;


    Specification(ItemType itemType, Stat baseStat) {
        this.itemType = itemType;
        this.baseStat = baseStat;
    }

    public ItemType itemType() {
        return itemType;
    }

    public Stat baseStat() {
        return baseStat;
    }

    public boolean appliesTo(ItemType type) {
        return itemType == type;
    }

    public static List<Specification> of(ItemType type) {
        return Arrays.stream(values()).filter(s -> s.appliesTo(type)).toList();
    }
}
