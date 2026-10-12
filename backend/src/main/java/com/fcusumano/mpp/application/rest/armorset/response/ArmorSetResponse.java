package com.fcusumano.mpp.application.rest.armorset.response;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.ArmorSetInfo;

public record ArmorSetResponse(ArmorSet armorSet, String bonusDescription) {

    public ArmorSetResponse(ArmorSetInfo info) {
        this(info.armorSet(), info.bonusDescription());
    }
}
