package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;

/** Set di armatura con la descrizione del bonus a 4 pezzi (solo testo, null se non ancora censito). */
public record ArmorSetInfo(ArmorSet armorSet, String bonusDescription) {
}
