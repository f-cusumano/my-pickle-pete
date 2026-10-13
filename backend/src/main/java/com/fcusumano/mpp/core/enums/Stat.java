package com.fcusumano.mpp.core.enums;

import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.core.enums.StatUnit.FLAT;
import static com.fcusumano.mpp.core.enums.StatUnit.PERCENT;
import static com.fcusumano.mpp.core.enums.StatUnit.SECONDS;

/**
 * Elenco fisso delle caratteristiche del gioco, nell'ordine in cui si mostrano.
 * L'unità è quella predefinita, proposta in censimento e usata per la statistica base del livello:
 * ogni potenziamento di armature e armi può comunque essere a valore o in percentuale.
 * Le caratteristiche non generali valgono solo per le abilità e non entrano nelle tabelle dei set.
 * Il Tempo di recupero si censisce in positivo ma è una riduzione: si mostra con il segno meno.
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
    KNOCKBACK(FLAT),
    COOLDOWN(SECONDS, false),
    DURATION(SECONDS, false),
    ACTION_RADIUS(PERCENT, false);

    private static final List<Stat> GENERAL = Arrays.stream(values()).filter(Stat::isGeneral).toList();

    private final StatUnit defaultUnit;
    private final boolean general;


    Stat(StatUnit defaultUnit) {
        this(defaultUnit, true);
    }

    Stat(StatUnit defaultUnit, boolean general) {
        this.defaultUnit = defaultUnit;
        this.general = general;
    }

    public StatUnit defaultUnit() {
        return defaultUnit;
    }

    /** {@code true} per le caratteristiche di armature e armi, mostrate nelle tabelle dei set. */
    public boolean isGeneral() {
        return general;
    }

    /** Caratteristiche di armature e armi, nell'ordine fisso. */
    public static List<Stat> general() {
        return GENERAL;
    }
}
