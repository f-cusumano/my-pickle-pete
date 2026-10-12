package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;

import java.math.BigDecimal;
import java.util.Objects;

/** Potenziamento di caratteristica sbloccato da un item quando raggiunge la rarità indicata. */
public record RarityBonus(Rarity rarity, Stat stat, BigDecimal amount) {

    public RarityBonus {
        Objects.requireNonNull(rarity, "rarity");
        Objects.requireNonNull(stat, "stat");
        Objects.requireNonNull(amount, "amount");
    }

    public static RarityBonus of(Rarity rarity, Stat stat, BigDecimal amount) {
        return new RarityBonus(rarity, stat, amount);
    }
}
