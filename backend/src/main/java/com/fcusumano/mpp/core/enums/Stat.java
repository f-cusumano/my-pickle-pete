package com.fcusumano.mpp.core.enums;

import static com.fcusumano.mpp.core.enums.StatUnit.FLAT;
import static com.fcusumano.mpp.core.enums.StatUnit.PERCENT;

/**
 * Elenco fisso delle caratteristiche del gioco, nell'ordine in cui si mostrano.
 * L'unità è quella predefinita, proposta in censimento e usata per la statistica base del livello:
 * ogni potenziamento può comunque essere a valore o in percentuale.
 */
public enum Stat {
    DAMAGE(PERCENT),
    MAX_HP(FLAT),
    ATTACK_SPEED(PERCENT),
    REGENERATION(FLAT),
    ARMOR(FLAT),
    PICK_UP_HEAL(FLAT),
    PICK_UP_RADIUS(PERCENT),
    MOVE_SPEED(PERCENT),
    XP_GAIN(PERCENT),
    DODGE_CHANCE(PERCENT),
    CRIT_CHANCE(PERCENT),
    CRIT_DAMAGE(PERCENT),
    LIFE_STEAL(PERCENT),
    MELEE_DAMAGE(FLAT),
    RANGED_DAMAGE(FLAT),
    ELEMENTAL_DAMAGE(FLAT),
    MECHANICAL_DAMAGE(FLAT),
    LUCK(FLAT),
    PATROL_EARNINGS(FLAT),
    BOSS_DAMAGE(PERCENT),
    INTEREST(PERCENT),
    KNOCKBACK(FLAT);

    private final StatUnit defaultUnit;


    Stat(StatUnit defaultUnit) {
        this.defaultUnit = defaultUnit;
    }

    public StatUnit defaultUnit() {
        return defaultUnit;
    }
}
