package com.fcusumano.mpp.application.rest.item.response;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.Item;

import java.util.List;

/** Item con la configurazione effettiva; l'immagine è quella predefinita della categoria, scelta dal frontend. */
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
                           List<RarityBonusResponse> bonuses) {

    public ItemResponse(Item item) {
        this(item.id(), item.name(), item.type(), item.specification(), item.armorSet(), item.rarity(), item.level(), item.maxLevel(),
             item.baseStat(), item.baseStatValue(),
             item.bonuses().stream()
                     .sorted((first, second) -> first.rarity().compareTo(second.rarity()))
                     .map(bonus -> new RarityBonusResponse(bonus.rarity(), bonus.stat(), bonus.unit(), bonus.amount(), item.bonusUnlocked(bonus)))
                     .toList());
    }

    public static List<ItemResponse> of(List<Item> items) {
        return items.stream().map(ItemResponse::new).toList();
    }
}
