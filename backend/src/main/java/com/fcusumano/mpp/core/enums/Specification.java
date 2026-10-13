package com.fcusumano.mpp.core.enums;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.fcusumano.mpp.core.enums.ItemType.ARMOR;
import static com.fcusumano.mpp.core.enums.ItemType.WEAPON;
import static com.fcusumano.mpp.core.enums.Stat.DAMAGE;
import static com.fcusumano.mpp.core.enums.Stat.ELEMENTAL_DAMAGE;
import static com.fcusumano.mpp.core.enums.Stat.MAX_HP;
import static com.fcusumano.mpp.core.enums.Stat.MECHANICAL_DAMAGE;
import static com.fcusumano.mpp.core.enums.Stat.MELEE_DAMAGE;
import static com.fcusumano.mpp.core.enums.Stat.RANGED_DAMAGE;

/**
 * Specifica di armi (categoria) e armature (slot), nell'ordine di visualizzazione di ciascuna tipologia.
 * Cappello e occhiali danno Danno, gli altri slot HP; le armi danno sempre Danno.
 * Ogni categoria di arma è potenziata da una caratteristica dei set (es. A distanza da Danno a distanza).
 */
public enum Specification {
    RANGED(WEAPON, DAMAGE, RANGED_DAMAGE),
    ELEMENTAL(WEAPON, DAMAGE, ELEMENTAL_DAMAGE),
    MECHANICAL(WEAPON, DAMAGE, MECHANICAL_DAMAGE),
    MELEE(WEAPON, DAMAGE, MELEE_DAMAGE),
    HAT(ARMOR, DAMAGE, null),
    GLASSES(ARMOR, DAMAGE, null),
    CHEST(ARMOR, MAX_HP, null),
    BACK(ARMOR, MAX_HP, null),
    BOOTS(ARMOR, MAX_HP, null);

    private final ItemType itemType;
    private final Stat baseStat;
    private final Stat weaponDamageStat;


    Specification(ItemType itemType, Stat baseStat, Stat weaponDamageStat) {
        this.itemType = itemType;
        this.baseStat = baseStat;
        this.weaponDamageStat = weaponDamageStat;
    }

    public ItemType itemType() {
        return itemType;
    }

    public Stat baseStat() {
        return baseStat;
    }

    /** Per le categorie di arma: la caratteristica dei set che potenzia quel tipo di arma (es. Danno a distanza). */
    public Optional<Stat> weaponDamageStat() {
        return Optional.ofNullable(weaponDamageStat);
    }

    public boolean appliesTo(ItemType type) {
        return itemType == type;
    }

    public static List<Specification> of(ItemType type) {
        return Arrays.stream(values()).filter(s -> s.appliesTo(type)).toList();
    }
}
