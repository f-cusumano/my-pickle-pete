package com.fcusumano.mpp.core.utils.bo;

/**
 * Danno (%) e HP (valore) dovuti al livello dei pezzi di un set e dell'arma: attuali e a rarità e livello massimi.
 * Stanno fuori dalla tabella delle caratteristiche, dove sarebbero sempre i valori più alti.
 */
public record LevelStats(int currentDamage, int topDamage, int currentHp, int topHp) {}
