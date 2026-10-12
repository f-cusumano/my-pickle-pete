package com.fcusumano.mpp.application.rest.item.response;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.Item;

import java.util.List;

/**
 * Item con la configurazione effettiva. {@code imageVersion} cambia a ogni nuova immagine (null se assente):
 * il frontend lo aggiunge all'URL dell'immagine per non usare quella in cache.
 */
public record ItemResponse(long id,
                           String name,
                           ItemType type,
                           Specification specification,
                           ArmorSet armorSet,
                           Rarity rarity,
                           int level,
                           int maxLevel,
                           Stat baseStat,
                           int baseStatValue,
                           List<RarityBonusResponse> bonuses,
                           Long imageVersion) {

    public ItemResponse(Item item) {
        this(item.id(), item.name(), item.type(), item.specification(), item.armorSet(), item.rarity(), item.level(), item.maxLevel(),
             item.baseStat(), item.baseStatValue(),
             item.bonuses().stream()
                     .sorted((first, second) -> first.rarity().compareTo(second.rarity()))
                     .map(bonus -> new RarityBonusResponse(bonus.rarity(), bonus.stat(), bonus.amount(), item.bonusUnlocked(bonus)))
                     .toList(),
             item.hasImage() ? item.imageUpdatedAt().toInstant().toEpochMilli() : null);
    }

    public static List<ItemResponse> of(List<Item> items) {
        return items.stream().map(ItemResponse::new).toList();
    }
}
