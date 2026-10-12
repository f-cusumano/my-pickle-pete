package com.fcusumano.mpp.application.rest.constants;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemSortOrder;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;

import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_BONUS_THRESHOLD;
import static com.fcusumano.mpp.core.Constants.BASE_STAT_PER_LEVEL;

/** Valori fissi del gioco nell'ordine di visualizzazione: il frontend li usa per menu, filtri e ordinamenti. */
public record GameConstantsResponse(List<RarityConstant> rarities,
                                    List<ItemTypeConstant> itemTypes,
                                    List<SpecificationConstant> specifications,
                                    List<ArmorSet> armorSets,
                                    List<StatConstant> stats,
                                    List<SortOrderConstant> sortOrders,
                                    int baseStatPerLevel,
                                    int armorSetBonusThreshold) {

    public record RarityConstant(Rarity code, int maxLevel) {}

    public record ItemTypeConstant(ItemType code, boolean specified, boolean partOfArmorSet) {}

    public record SpecificationConstant(Specification code, ItemType itemType, Stat baseStat) {}

    public record StatConstant(Stat code, StatUnit unit) {}

    public record SortOrderConstant(ItemSortOrder code, List<ItemType> typeOrder, boolean preselected) {}


    public static GameConstantsResponse build() {
        return new GameConstantsResponse(
                Arrays.stream(Rarity.values()).map(r -> new RarityConstant(r, r.maxLevel())).toList(),
                Arrays.stream(ItemType.values()).map(t -> new ItemTypeConstant(t, t.isSpecified(), t.isPartOfArmorSet())).toList(),
                Arrays.stream(Specification.values()).map(s -> new SpecificationConstant(s, s.itemType(), s.baseStat())).toList(),
                List.of(ArmorSet.values()),
                Arrays.stream(Stat.values()).map(s -> new StatConstant(s, s.unit())).toList(),
                Arrays.stream(ItemSortOrder.values()).map(o -> new SortOrderConstant(o, o.typeOrder(), o == ItemSortOrder.defaultOrder())).toList(),
                BASE_STAT_PER_LEVEL,
                ARMOR_SET_BONUS_THRESHOLD);
    }
}
