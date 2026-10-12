package com.fcusumano.mpp.application.rest.armorset.request;

import jakarta.validation.constraints.Size;

import static com.fcusumano.mpp.core.Constants.MAX_BONUS_DESCRIPTION_LENGTH;

/** Descrizione testuale del bonus a 4 pezzi; vuota o null la rimuove. */
public record ArmorSetRequest(@Size(max = MAX_BONUS_DESCRIPTION_LENGTH, message = "Bonus description allows at most 500 characters.")
                              String bonusDescription) {
}
