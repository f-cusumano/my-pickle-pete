package com.fcusumano.mpp.core.validation;

import com.fcusumano.mpp.core.model.ItemDefinition;

/** Oggetto (tipicamente una request) convertibile nei dati di censimento di un item. */
public interface ItemDefinitionProvider {

    ItemDefinition toDefinition();
}
