package com.fcusumano.mpp.core.model;

import java.time.OffsetDateTime;

/** Immagine caricata per un item; {@code updatedAt} serve al browser per capire quando ricaricarla. */
public record ItemImage(String contentType, byte[] data, OffsetDateTime updatedAt) {
}
