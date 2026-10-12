package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.InternalErrorCode;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
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
        final Map<Stat, BigDecimal> stats = BOOTS.currentStats();
        Assertions.assertEquals(0, new BigDecimal("100").compareTo(stats.get(Stat.MAX_HP)));
        Assertions.assertEquals(0, new BigDecimal("3").compareTo(stats.get(Stat.LUCK))); //Epico non ancora sbloccato
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(stats.get(Stat.PICK_UP_RADIUS)));
        Assertions.assertEquals(3, stats.size());
    }

    @Test
    void topStatsUseArtifactAtLevel99() {
        final Map<Stat, BigDecimal> stats = BOOTS.topStats();
        Assertions.assertEquals(0, new BigDecimal("406").compareTo(stats.get(Stat.MAX_HP))); //4 x 99 + 10 dell'Artefatto
        Assertions.assertEquals(0, new BigDecimal("5.5").compareTo(stats.get(Stat.LUCK)));
    }

    @Test
    void promotionKeepsLevel() {
        final Item promoted = BOOTS.promoted();
        Assertions.assertEquals(Rarity.EPIC, promoted.rarity());
        Assertions.assertEquals(25, promoted.level());
        Assertions.assertEquals(40, promoted.maxLevel());
    }

    @Test
    void promotionBeyondArtifactFails() {
        final Item artifact = armor(4, "Petto", ArmorSet.VIKING, Specification.CHEST, Rarity.ARTIFACT, 99);
        final BadRequestException exception = Assertions.assertThrows(BadRequestException.class, artifact::promoted);
        Assertions.assertEquals(InternalErrorCode.MAX_RARITY_REACHED, exception.internalErrorCode());
    }

    @Test
    void resetCapsLevelToCommonMaximum() {
        Assertions.assertEquals(Rarity.COMMON, BOOTS.reset().rarity());
        Assertions.assertEquals(10, BOOTS.reset().level());
        final Item lowLevel = BOOTS.withLevel(7).reset();
        Assertions.assertEquals(7, lowLevel.level());
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
