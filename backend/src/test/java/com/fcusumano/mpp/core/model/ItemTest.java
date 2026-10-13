package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.InternalErrorCode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static com.fcusumano.mpp.TestItems.ability;
import static com.fcusumano.mpp.TestItems.armor;
import static com.fcusumano.mpp.TestItems.bonus;

class ItemTest {

    private static final Item BOOTS = armor(1, "Stivali di prova", ArmorSet.COWBOY, Specification.BOOTS, Rarity.RARE, 25,
                                            bonus(Rarity.UNCOMMON, Stat.LUCK, "3"),
                                            bonus(Rarity.RARE, Stat.PICK_UP_RADIUS, "5"),
                                            bonus(Rarity.EPIC, Stat.LUCK, "2.5"),
                                            bonus(Rarity.ARTIFACT, Stat.MAX_HP, "10"));


    @Test
    void baseStatDependsOnSlot() {
        Assertions.assertEquals(Stat.MAX_HP, BOOTS.baseStat());
        Assertions.assertEquals(Stat.DAMAGE, armor(2, "Cappello", ArmorSet.COWBOY, Specification.HAT, Rarity.COMMON, 1).baseStat());
        Assertions.assertEquals(Stat.DAMAGE, ability(3, "Barattolo", Rarity.COMMON, 1).baseStat()); //Abilità senza specifica
        Assertions.assertEquals(100, BOOTS.baseStatValue()); //4 x 25
    }

    @Test
    void currentStatsSumOnlyUnlockedBonuses() {
        final Map<StatKey, BigDecimal> stats = BOOTS.currentStats();
        Assertions.assertEquals(0, new BigDecimal("3").compareTo(stats.get(StatKey.defaultOf(Stat.LUCK)))); //Epico non ancora sbloccato
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(stats.get(StatKey.defaultOf(Stat.PICK_UP_RADIUS))));
        Assertions.assertEquals(2, stats.size()); //Gli HP del livello stanno fuori
    }

    @Test
    void topStatsUseAllBonusesWithoutLevel() {
        final Map<StatKey, BigDecimal> stats = BOOTS.topStats();
        Assertions.assertEquals(0, new BigDecimal("10").compareTo(stats.get(StatKey.defaultOf(Stat.MAX_HP)))); //Solo l'Artefatto
        Assertions.assertEquals(0, new BigDecimal("5.5").compareTo(stats.get(StatKey.defaultOf(Stat.LUCK))));
        Assertions.assertEquals(396, BOOTS.topBaseStatValue()); //4 x 99
    }

    @Test
    void sameStatInDifferentUnitsStaysSeparate() {
        final Item hat = armor(2, "Cappello", ArmorSet.COWBOY, Specification.HAT, Rarity.EPIC, 1,
                               bonus(Rarity.UNCOMMON, Stat.LUCK, StatUnit.FLAT, "3"),
                               bonus(Rarity.RARE, Stat.LUCK, StatUnit.PERCENT, "5"),
                               bonus(Rarity.EPIC, Stat.DAMAGE, StatUnit.FLAT, "2"));
        final Map<StatKey, BigDecimal> stats = hat.currentStats();
        Assertions.assertEquals(0, new BigDecimal("3").compareTo(stats.get(StatKey.of(Stat.LUCK, StatUnit.FLAT))));
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(stats.get(StatKey.of(Stat.LUCK, StatUnit.PERCENT))));
        Assertions.assertFalse(stats.containsKey(StatKey.of(Stat.DAMAGE, StatUnit.PERCENT))); //Il Danno del livello sta fuori
        Assertions.assertEquals(0, new BigDecimal("2").compareTo(stats.get(StatKey.of(Stat.DAMAGE, StatUnit.FLAT))));
        //Ordine fisso, unità predefinita prima dell'altra
        Assertions.assertEquals(List.of(StatKey.of(Stat.DAMAGE, StatUnit.FLAT), StatKey.of(Stat.LUCK, StatUnit.FLAT),
                                        StatKey.of(Stat.LUCK, StatUnit.PERCENT)),
                                List.copyOf(stats.keySet()));
    }

    @Test
    void higherRarityKeepsLevel() {
        final Item promoted = BOOTS.withRarity(Rarity.LEGENDARY);
        Assertions.assertEquals(Rarity.LEGENDARY, promoted.rarity());
        Assertions.assertEquals(25, promoted.level());
        Assertions.assertEquals(50, promoted.maxLevel());
    }

    @Test
    void lowerRarityCapsLevelToNewMaximum() {
        final Item uncommon = BOOTS.withRarity(Rarity.UNCOMMON);
        Assertions.assertEquals(Rarity.UNCOMMON, uncommon.rarity());
        Assertions.assertEquals(20, uncommon.level());
        Assertions.assertEquals(10, BOOTS.withRarity(Rarity.COMMON).level());
        Assertions.assertEquals(7, BOOTS.withLevel(7).withRarity(Rarity.COMMON).level());
    }

    @Test
    void levelMustStayWithinRarityRange() {
        Assertions.assertEquals(30, BOOTS.withLevel(30).level());
        Assertions.assertEquals(InternalErrorCode.LEVEL_OUT_OF_RANGE,
                                Assertions.assertThrows(BadRequestException.class, () -> BOOTS.withLevel(31)).internalErrorCode());
        Assertions.assertEquals(InternalErrorCode.LEVEL_OUT_OF_RANGE,
                                Assertions.assertThrows(BadRequestException.class, () -> BOOTS.withLevel(0)).internalErrorCode());
    }

    @Test
    void newItemStartsFromCommonLevelOne() {
        final Item item = Item.of(9L, new ItemDefinition(" Pistola ", com.fcusumano.mpp.core.enums.ItemType.WEAPON, Specification.RANGED, null, null));
        Assertions.assertEquals("Pistola", item.name());
        Assertions.assertEquals(Rarity.COMMON, item.rarity());
        Assertions.assertEquals(1, item.level());
        Assertions.assertEquals(10, item.maxLevel());
    }
}
