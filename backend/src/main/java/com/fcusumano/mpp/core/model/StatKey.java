package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;

import java.util.Comparator;
import java.util.Objects;

/**
 * Caratteristica con la sua unità: "+5% Fortuna" e "+5 Fortuna" sono valori diversi e non si sommano.
 * Ordine: quello fisso delle caratteristiche, con l'unità predefinita prima dell'altra.
 */
public record StatKey(Stat stat, StatUnit unit) implements Comparable<StatKey> {

    private static final Comparator<StatKey> ORDER = Comparator.comparing(StatKey::stat)
            .thenComparing(StatKey::isDefault, Comparator.reverseOrder());

    public StatKey {
        Objects.requireNonNull(stat, "stat");
        Objects.requireNonNull(unit, "unit");
    }

    public static StatKey of(Stat stat, StatUnit unit) {
        return new StatKey(stat, unit);
    }

    /** La caratteristica con la sua unità predefinita, quella mostrata sempre nelle tabelle dei set. */
    public static StatKey defaultOf(Stat stat) {
        return new StatKey(stat, stat.defaultUnit());
    }

    public boolean isDefault() {
        return unit == stat.defaultUnit();
    }

    @Override
    public int compareTo(StatKey other) {
        return ORDER.compare(this, other);
    }
}
