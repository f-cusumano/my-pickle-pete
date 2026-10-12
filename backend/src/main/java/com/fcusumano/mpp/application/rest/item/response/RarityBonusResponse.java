package com.fcusumano.mpp.application.rest.item.response;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;

import java.math.BigDecimal;

/** Potenziamento di una rarità; {@code unlocked} indica se la rarità effettiva dell'item lo ha già sbloccato. */
public record RarityBonusResponse(Rarity rarity, Stat stat, BigDecimal amount, boolean unlocked) {
}
