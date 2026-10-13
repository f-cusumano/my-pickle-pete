package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Potenziamento di caratteristica sbloccato da un item quando raggiunge la rarità indicata.
 * {@code own} (armi e abilità) indica un potenziamento del solo item, es. "+10% al proprio danno".
 */
public record RarityBonus(Rarity rarity, Stat stat, StatUnit unit, BigDecimal amount, boolean own) {

    public RarityBonus {
        Objects.requireNonNull(rarity, "rarity");
        Objects.requireNonNull(stat, "stat");
        Objects.requireNonNull(unit, "unit");
        Objects.requireNonNull(amount, "amount");
    }

    public static RarityBonus of(Rarity rarity, Stat stat, StatUnit unit, BigDecimal amount) {
        return new RarityBonus(rarity, stat, unit, amount, false);
    }

    public static RarityBonus ownOf(Rarity rarity, Stat stat, StatUnit unit, BigDecimal amount) {
        return new RarityBonus(rarity, stat, unit, amount, true);
    }

    public StatKey key() {
        return new StatKey(stat, unit, own);
    }
}
