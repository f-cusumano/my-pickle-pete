package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.utils.bo.SetStatistics;
import com.fcusumano.mpp.core.utils.bo.WeaponAdvice;

import java.util.List;

/** Tipi di arma consigliati e sconsigliati da un set, con le caratteristiche attuali e top (liste vuote se tutti pari). */
public record WeaponAdviceResponse(List<Specification> recommendedNow, List<Specification> discouragedNow,
                                   List<Specification> recommendedTop, List<Specification> discouragedTop) {

    public WeaponAdviceResponse(SetStatistics statistics) {
        this(statistics.currentAdvice(), statistics.topAdvice());
    }

    private WeaponAdviceResponse(WeaponAdvice now, WeaponAdvice top) {
        this(now.recommended(), now.discouraged(), top.recommended(), top.discouraged());
    }
}
