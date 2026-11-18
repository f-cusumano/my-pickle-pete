package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.model.CustomSet;
import com.fcusumano.mpp.core.model.CustomSetDefinition;

import java.util.List;
import java.util.Optional;

/** Persistenza dei set custom di ogni utente, dei loro pezzi, dell'arma e dell'abilità. */
public interface CustomSetRepository {

    List<CustomSet> retrieveAll(long userId);

    /** Vuoto anche se il set esiste ma è di un altro utente. */
    Optional<CustomSet> retrieve(long userId, long id);

    /** Ricerca senza distinzione di maiuscole tra i set dell'utente. */
    Optional<Long> retrieveIdByName(long userId, String name);

    long insert(long userId, CustomSetDefinition definition);

    void update(long id, CustomSetDefinition definition);

    void delete(long id);

    /** Toglie l'item dai set custom di tutti gli utenti che lo indossano (cancellazione o cambio di slot dell'item). */
    int deletePiecesOfItem(long itemId);

    /** Toglie l'arma dai set custom di tutti gli utenti che la usano (cancellazione dell'item o cambio di tipologia). */
    int clearWeapon(long itemId);

    /** Toglie l'abilità dai set custom di tutti gli utenti che la usano (cancellazione dell'item o cambio di tipologia). */
    int clearAbility(long itemId);
}
