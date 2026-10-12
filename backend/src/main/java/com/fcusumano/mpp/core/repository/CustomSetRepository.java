package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.model.CustomSet;
import com.fcusumano.mpp.core.model.CustomSetDefinition;

import java.util.List;
import java.util.Optional;

/** Persistenza dei set custom e dei loro pezzi. */
public interface CustomSetRepository {

    List<CustomSet> retrieveAll();

    Optional<CustomSet> retrieve(long id);

    Optional<Long> retrieveIdByName(String name);

    long insert(CustomSetDefinition definition);

    void update(long id, CustomSetDefinition definition);

    void delete(long id);

    /** Toglie l'item da tutti i set custom che lo indossano (cancellazione o cambio di slot dell'item). */
    int deletePiecesOfItem(long itemId);
}
