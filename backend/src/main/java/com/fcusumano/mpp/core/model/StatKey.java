package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;

import java.util.Comparator;
import java.util.Objects;

/**
 * Caratteristica con la sua unità: "+5% Fortuna" e "+5 Fortuna" sono valori diversi e non si sommano.
 * Le caratteristiche "proprie" di un'arma ("+10% al proprio danno") valgono solo per l'arma e restano separate.
 * Ordine: prima quelle generali, poi le proprie; in ciascun gruppo l'ordine fisso delle caratteristiche,
 * con l'unità predefinita prima dell'altra.
 */
public record StatKey(Stat stat, StatUnit unit, boolean own) implements Comparable<StatKey> {

    private static final Comparator<StatKey> ORDER = Comparator.comparing(StatKey::own)
            .thenComparing(StatKey::stat)
            .thenComparing(StatKey::isDefault, Comparator.reverseOrder());

    public StatKey {
        Objects.requireNonNull(stat, "stat");
        Objects.requireNonNull(unit, "unit");
    }

    public static StatKey of(Stat stat, StatUnit unit) {
        return new StatKey(stat, unit, false);
    }

    /** Caratteristica propria di un'arma, es. "+10% al proprio danno". */
    public static StatKey ownOf(Stat stat, StatUnit unit) {
        return new StatKey(stat, unit, true);
    }

    /** La caratteristica con la sua unità predefinita, quella mostrata sempre nelle tabelle dei set. */
    public static StatKey defaultOf(Stat stat) {
        return of(stat, stat.defaultUnit());
    }

    /** La stessa caratteristica nell'unità diversa da quella predefinita. */
    public static StatKey otherUnitOf(Stat stat) {
        return of(stat, stat.defaultUnit() == StatUnit.FLAT ? StatUnit.PERCENT : StatUnit.FLAT);
    }

    public boolean isDefault() {
        return unit == stat.defaultUnit();
    }

    @Override
    public int compareTo(StatKey other) {
        return ORDER.compare(this, other);
    }
}
