package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.ItemDefinition;

import java.util.List;
import java.util.Optional;

/** Persistenza degli item censiti e dei loro potenziamenti. */
public interface ItemRepository {

    List<Item> retrieveAll();

    Optional<Item> retrieve(long id);

    Optional<Long> retrieveIdByName(String name);

    Optional<Long> retrieveIdByArmorSlot(ArmorSet armorSet, Specification specification);

    long insert(ItemDefinition definition);

    void update(long id, ItemDefinition definition);

    void updateProgress(long id, Rarity rarity, int level);

    void delete(long id);
}
