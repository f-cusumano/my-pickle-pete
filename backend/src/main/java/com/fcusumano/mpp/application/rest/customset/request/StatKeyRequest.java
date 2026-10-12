package com.fcusumano.mpp.application.rest.customset.request;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.StatKey;
import jakarta.validation.constraints.NotNull;

/** Caratteristica con la sua unità ("+5% Fortuna" e "+5 Fortuna" sono caratteristiche diverse). */
public record StatKeyRequest(@NotNull(message = "Stat must be specified.") Stat stat,
                             @NotNull(message = "Stat unit must be specified.") StatUnit unit) {

    public StatKey toModel() {
        return StatKey.of(stat, unit);
    }
}
