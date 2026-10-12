package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.model.StatKey;

import java.util.Set;

import static com.fcusumano.mpp.core.utils.bo.Highlight.BEST;
import static com.fcusumano.mpp.core.utils.bo.Highlight.NONE;
import static com.fcusumano.mpp.core.utils.bo.Highlight.WORST;

/** Caratteristiche di picco (alone verde) e peggiori (alone rosso) di una colonna; mai sovrapposte. */
public record StatHighlights(Set<StatKey> best, Set<StatKey> worst) {

    public StatHighlights {
        best = Set.copyOf(best);
        worst = Set.copyOf(worst);
    }

    public static StatHighlights none() {
        return new StatHighlights(Set.of(), Set.of());
    }

    public Highlight highlight4(StatKey key) {
        if (best.contains(key)) return BEST;
        if (worst.contains(key)) return WORST;
        return NONE;
    }

    @Override
    public String toString() {
        return "StatHighlights[best=%s, worst=%s]".formatted(best, worst);
    }
}
