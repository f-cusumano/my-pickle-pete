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
                                    List<StatUnit> statUnits,
                                    List<StatConstant> stats,
                                    List<SortOrderConstant> sortOrders,
                                    int baseStatPerLevel,
                                    int armorSetBonusThreshold) {

    public record RarityConstant(Rarity code, int maxLevel) {}

    /** {@code fixedBonuses}: potenziamenti possibili quando sono un elenco chiuso (abilità), vuoto altrimenti. */
    public record ItemTypeConstant(ItemType code, boolean specified, boolean partOfArmorSet, List<StatKeyConstant> fixedBonuses) {}

    public record StatKeyConstant(Stat stat, StatUnit unit, boolean own) {}

    public record SpecificationConstant(Specification code, ItemType itemType, Stat baseStat) {}

    /** {@code general}: caratteristica di armature e armi (le altre valgono solo per le abilità). */
    public record StatConstant(Stat code, StatUnit defaultUnit, boolean general) {}

    public record SortOrderConstant(ItemSortOrder code, List<ItemType> typeOrder, boolean preselected) {}


    public static GameConstantsResponse build() {
        return new GameConstantsResponse(
                Arrays.stream(Rarity.values()).map(r -> new RarityConstant(r, r.maxLevel())).toList(),
                Arrays.stream(ItemType.values())
                        .map(t -> new ItemTypeConstant(t, t.isSpecified(), t.isPartOfArmorSet(),
                                                       t.fixedBonusKeys().stream().map(k -> new StatKeyConstant(k.stat(), k.unit(), k.own())).toList()))
                        .toList(),
                Arrays.stream(Specification.values()).map(s -> new SpecificationConstant(s, s.itemType(), s.baseStat())).toList(),
                List.of(ArmorSet.values()),
                List.of(StatUnit.values()),
                Arrays.stream(Stat.values()).map(s -> new StatConstant(s, s.defaultUnit(), s.isGeneral())).toList(),
                Arrays.stream(ItemSortOrder.values()).map(o -> new SortOrderConstant(o, o.typeOrder(), o == ItemSortOrder.defaultOrder())).toList(),
                BASE_STAT_PER_LEVEL,
                ARMOR_SET_BONUS_THRESHOLD);
    }
}
