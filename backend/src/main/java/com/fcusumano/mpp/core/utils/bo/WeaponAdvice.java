package com.fcusumano.mpp.core.utils.bo;

import com.fcusumano.mpp.core.enums.Specification;

import java.util.List;

/**
 * Tipi di arma consigliati (caratteristica di tipo più alta nel set) e sconsigliati (più bassa, anche 0),
 * più di uno a pari valore; entrambi vuoti se tutti i tipi hanno lo stesso valore.
 */
public record WeaponAdvice(List<Specification> recommended, List<Specification> discouraged) {

    public WeaponAdvice {
        recommended = List.copyOf(recommended);
        discouraged = List.copyOf(discouraged);
    }

    public static WeaponAdvice none() {
        return new WeaponAdvice(List.of(), List.of());
    }
}
