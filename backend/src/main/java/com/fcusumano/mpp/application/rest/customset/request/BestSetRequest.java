package com.fcusumano.mpp.application.rest.customset.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/** Caratteristica principale (obbligatoria) e secondaria (facoltativa, fa da spareggio) da massimizzare. */
public record BestSetRequest(@NotNull(message = "Primary stat must be specified.") @Valid StatKeyRequest primary,
                             @Valid StatKeyRequest secondary) {
}
