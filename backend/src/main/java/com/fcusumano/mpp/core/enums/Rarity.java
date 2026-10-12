package com.fcusumano.mpp.core.enums;

import java.util.Arrays;
import java.util.List;

/** Rarità in ordine crescente: ognuna fissa il livello massimo e, tranne Comune, sblocca un potenziamento. */
public enum Rarity {
    COMMON(10),
    UNCOMMON(20),
    RARE(30),
    EPIC(40),
    LEGENDARY(50),
    ARTIFACT(99);

    private final int maxLevel;


    Rarity(int maxLevel) {
        this.maxLevel = maxLevel;
    }

    public int maxLevel() {
        return maxLevel;
    }

    /** Rarità di partenza di ogni item censito. */
    public static Rarity base() {
        return COMMON;
    }

    /** Rarità massima, usata per la versione "top" degli item. */
    public static Rarity top() {
        return ARTIFACT;
    }

    public boolean isTop() {
        return this == top();
    }

    public Rarity next() {
        if (isTop()) throw new IllegalStateException("Rarity '%s' has no next rarity.".formatted(this));
        return values()[ordinal() + 1];
    }

    public boolean unlocksBonus() {
        return this != base();
    }

    /** {@code true} se questa rarità è già raggiunta da un item della rarità indicata. */
    public boolean reachedBy(Rarity current) {
        return ordinal() <= current.ordinal();
    }

    public boolean levelInRange(int level) {
        return level >= 1 && level <= maxLevel;
    }

    /** Rarità che sbloccano un potenziamento, in ordine crescente. */
    public static List<Rarity> bonusRarities() {
        return Arrays.stream(values()).filter(Rarity::unlocksBonus).toList();
    }
}
