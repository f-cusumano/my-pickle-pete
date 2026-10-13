package com.fcusumano.mpp.application.rest.item.response;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;

import java.math.BigDecimal;

/**
 * Potenziamento di una rarità; {@code own} indica un potenziamento della sola arma,
 * {@code unlocked} se la rarità effettiva dell'item lo ha già sbloccato.
 */
public record RarityBonusResponse(Rarity rarity, Stat stat, StatUnit unit, BigDecimal amount, boolean own, boolean unlocked) {
}
