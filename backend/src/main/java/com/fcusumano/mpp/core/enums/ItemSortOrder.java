package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;

import java.util.Comparator;
import java.util.List;

import static com.fcusumano.mpp.core.enums.ItemType.ABILITY;
import static com.fcusumano.mpp.core.enums.ItemType.ARMOR;
import static com.fcusumano.mpp.core.enums.ItemType.WEAPON;
import static java.util.Comparator.comparing;

/** Ordinamenti preimpostati della pagina Items. */
public enum ItemSortOrder {
    ARMOR_SET(List.of(ARMOR, WEAPON, ABILITY), false),
    WEAPONS_FIRST(List.of(WEAPON, ABILITY, ARMOR), false),
    RARITY(List.of(ARMOR, WEAPON, ABILITY), true);

    private final List<ItemType> typeOrder;
    private final boolean rarityFirst;


    ItemSortOrder(List<ItemType> typeOrder, boolean rarityFirst) {
        this.typeOrder = typeOrder;
        this.rarityFirst = rarityFirst;
    }

    /** Ordinamento proposto all'apertura della pagina. */
    public static ItemSortOrder defaultOrder() {
        return ARMOR_SET;
    }

    public List<ItemType> typeOrder() {
        return typeOrder;
    }

    public Comparator<Item> comparator() {
        final Comparator<Item> byTypeThenDetail = comparing((Item item) -> typeOrder.indexOf(item.type()))
                .thenComparing(ItemSortOrder::compareWithinType);
        return rarityFirst
               ? comparing(Item::rarity, Comparator.reverseOrder()).thenComparing(byTypeThenDetail)
               : byTypeThenDetail;
    }

    private static int compareWithinType(Item first, Item second) {
        return first.type().detailComparator().compare(first, second); //Chiamato solo a parità di tipologia
    }
}
