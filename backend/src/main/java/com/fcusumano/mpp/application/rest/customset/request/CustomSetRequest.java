package com.fcusumano.mpp.application.rest.customset.request;

import com.fcusumano.mpp.core.model.CustomSetDefinition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_PIECES;
import static com.fcusumano.mpp.core.Constants.MAX_CUSTOM_SET_NAME_LENGTH;

/** Set custom da salvare (creazione e modifica): nome, item indossati (al massimo uno per slot) e arma facoltativa. */
public record CustomSetRequest(@NotBlank(message = "Custom set name must be specified.")
                               @Size(max = MAX_CUSTOM_SET_NAME_LENGTH, message = "Custom set name allows at most 100 characters.") String name,
                               @Size(max = ARMOR_SET_PIECES, message = "A custom set has at most 5 pieces.") List<@NotNull Long> itemIds,
                               Long weaponId) {

    public CustomSetDefinition toDefinition() {
        return new CustomSetDefinition(name, itemIds, weaponId);
    }
}
