package com.fcusumano.mpp.core.enums;

import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.core.enums.StatUnit.FLAT;
import static com.fcusumano.mpp.core.enums.StatUnit.PERCENT;
import static com.fcusumano.mpp.core.enums.StatUnit.SECONDS;

/**
 * Elenco fisso delle caratteristiche del gioco, nell'ordine in cui si mostrano.
 * L'unità è l'unica con cui il gioco usa la caratteristica: il censimento di armature e armi la impone e le tabelle
 * dei set la mostrano sempre.
 * Le caratteristiche generali valgono per armature e armi e sono le righe delle tabelle dei set; le altre valgono solo
 * come potenziamento proprio di un'arma (Perforare) o solo per le abilità.
 * Il Tempo di recupero si censisce in positivo ma è una riduzione: si mostra con il segno meno.
 */
public enum Stat {
    DAMAGE(PERCENT),
    MAX_HP(PERCENT),
    ATTACK_SPEED(PERCENT),
    REGENERATION(FLAT),
    ARMOR(FLAT),
    PICK_UP_HEAL(PERCENT),
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
    PATROL_EARNINGS(PERCENT),
    BOSS_DAMAGE(PERCENT),
    INTEREST(PERCENT),
    KNOCKBACK(PERCENT),
    PIERCE(FLAT, Scope.WEAPON_OWN),
    COOLDOWN(SECONDS, Scope.ABILITY),
    DURATION(SECONDS, Scope.ABILITY),
    ACTION_RADIUS(PERCENT, Scope.ABILITY);

    /** Dove si può usare la caratteristica. */
    private enum Scope { GENERAL, WEAPON_OWN, ABILITY }

    private static final List<Stat> GENERAL = Arrays.stream(values()).filter(Stat::isGeneral).toList();

    private final StatUnit defaultUnit;
    private final Scope scope;


    Stat(StatUnit defaultUnit) {
        this(defaultUnit, Scope.GENERAL);
    }

    Stat(StatUnit defaultUnit, Scope scope) {
        this.defaultUnit = defaultUnit;
        this.scope = scope;
    }

    public StatUnit defaultUnit() {
        return defaultUnit;
    }

    /** {@code true} per le caratteristiche di armature e armi, mostrate nelle tabelle dei set. */
    public boolean isGeneral() {
        return scope == Scope.GENERAL;
    }

    /** {@code true} per le caratteristiche che esistono solo come potenziamento proprio di un'arma. */
    public boolean isWeaponOwnOnly() {
        return scope == Scope.WEAPON_OWN;
    }

    /** Caratteristiche di armature e armi, nell'ordine fisso. */
    public static List<Stat> general() {
        return GENERAL;
    }
}
