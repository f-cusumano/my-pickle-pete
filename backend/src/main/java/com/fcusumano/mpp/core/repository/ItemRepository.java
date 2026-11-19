package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.ItemDefinition;

import java.util.List;
import java.util.Optional;

/** Persistenza degli item censiti, dei loro potenziamenti e dei progressi (rarità e livello) di ogni utente. */
public interface ItemRepository {

    /** Item con i progressi dell'utente: senza progressi salvati valgono Comune 1. */
    List<Item> retrieveAll(long userId);

    Optional<Item> retrieve(long userId, long id);

    Optional<Long> retrieveIdByName(String name);

    Optional<Long> retrieveIdByArmorSlot(ArmorSet armorSet, Specification specification);

    long insert(ItemDefinition definition);

    void update(long id, ItemDefinition definition);

    void updateProgress(long userId, long id, Rarity rarity, int level);

    /** Cancella anche i progressi di tutti gli utenti. */
    void delete(long id);
}
