package com.fcusumano.mpp.application.rest.item.request;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.RarityBonus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RarityBonusRequest(@NotNull(message = "Bonus rarity must be specified.") Rarity rarity,
                                 @NotNull(message = "Bonus stat must be specified.") Stat stat,
                                 @NotNull(message = "Bonus unit must be specified.") StatUnit unit,
                                 @NotNull(message = "Bonus amount must be specified.")
                                 @DecimalMin(value = "1", message = "Bonus amount must be at least 1.")
                                 @Digits(integer = 5, fraction = 2, message = "Bonus amount allows at most 5 integer and 2 decimal digits.")
                                 BigDecimal amount,
                                 Boolean own) {

    /** {@code own} assente vale come potenziamento generale (non proprio dell'arma). */
    public RarityBonus toModel() {
        return new RarityBonus(rarity, stat, unit, amount, Boolean.TRUE.equals(own));
    }
}
