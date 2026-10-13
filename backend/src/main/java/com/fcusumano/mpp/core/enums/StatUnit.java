package com.fcusumano.mpp.core.enums;

import java.util.List;

/**
 * Unità con cui si esprime un valore: in percentuale ("+40% Danno"), a valore ("+40 HP") o in secondi
 * (solo per le caratteristiche delle abilità, es. "-2s Tempo di recupero").
 */
public enum StatUnit {
    PERCENT,
    FLAT,
    SECONDS;

    /** Unità tra cui si sceglie nel censimento di armature e armi. */
    public static final List<StatUnit> GENERAL = List.of(PERCENT, FLAT);
}
