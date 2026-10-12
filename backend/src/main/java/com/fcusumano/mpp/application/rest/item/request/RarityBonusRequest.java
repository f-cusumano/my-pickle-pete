package com.fcusumano.mpp.application.rest.item.request;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.RarityBonus;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RarityBonusRequest(@NotNull(message = "Bonus rarity must be specified.") Rarity rarity,
                                 @NotNull(message = "Bonus stat must be specified.") Stat stat,
                                 @NotNull(message = "Bonus amount must be specified.")
                                 @Positive(message = "Bonus amount must be positive.")
                                 @Digits(integer = 5, fraction = 2, message = "Bonus amount allows at most 5 integer and 2 decimal digits.")
                                 BigDecimal amount) {

    public RarityBonus toModel() {
        return RarityBonus.of(rarity, stat, amount);
    }
}
