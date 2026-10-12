package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import com.fcusumano.mpp.core.utils.bo.Highlight;
import com.fcusumano.mpp.core.utils.bo.StatComparison;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.TestItems.armor;
import static com.fcusumano.mpp.TestItems.bonus;

class SetStatisticsCalculatorTest {

    private static final List<Item> COWBOY = List.of(
            armor(1, "Cappello", ArmorSet.COWBOY, Specification.HAT, Rarity.UNCOMMON, 5, bonus(Rarity.UNCOMMON, Stat.CRIT_CHANCE, "2")),
            armor(2, "Occhiali", ArmorSet.COWBOY, Specification.GLASSES, Rarity.COMMON, 3, bonus(Rarity.UNCOMMON, Stat.CRIT_CHANCE, "2")),
            armor(3, "Petto", ArmorSet.COWBOY, Specification.CHEST, Rarity.COMMON, 10),
            armor(4, "Schiena", ArmorSet.COWBOY, Specification.BACK, Rarity.COMMON, 1),
            armor(5, "Stivali", ArmorSet.COWBOY, Specification.BOOTS, Rarity.COMMON, 1));


    @Test
    void oneRowPerStatInFixedOrder() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY);
        Assertions.assertEquals(Arrays.stream(Stat.values()).map(StatKey::defaultOf).toList(), rows.stream().map(StatComparison::key).toList());
    }

    @Test
    void otherUnitAddsItsOwnRowEvenIfStillLocked() {
        final Item glasses = armor(6, "Occhiali", ArmorSet.VIKING, Specification.GLASSES, Rarity.COMMON, 1,
                                   bonus(Rarity.RARE, Stat.LUCK, StatUnit.PERCENT, "5"));
        final List<StatComparison> rows = SetStatisticsCalculator.compare(List.of(glasses));
        Assertions.assertEquals(Stat.values().length + 1, rows.size());
        final StatComparison luckPercent = rows.stream().filter(r -> r.key().equals(StatKey.of(Stat.LUCK, StatUnit.PERCENT))).findFirst().orElseThrow();
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(luckPercent.current())); //Raro non ancora raggiunto
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(luckPercent.top()));
        //Subito dopo la Fortuna nella sua unità predefinita
        Assertions.assertEquals(StatKey.defaultOf(Stat.LUCK), rows.get(rows.indexOf(luckPercent) - 1).key());
    }

    @Test
    void currentAndTopSums() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY);
        final StatComparison damage = row(rows, Stat.DAMAGE);
        Assertions.assertEquals(0, new BigDecimal("32").compareTo(damage.current())); //4 x (5 + 3)
        Assertions.assertEquals(0, new BigDecimal("792").compareTo(damage.top())); //2 x 4 x 99
        final StatComparison hp = row(rows, Stat.MAX_HP);
        Assertions.assertEquals(0, new BigDecimal("48").compareTo(hp.current())); //4 x (10 + 1 + 1)
        Assertions.assertEquals(0, new BigDecimal("1188").compareTo(hp.top()));
        final StatComparison crit = row(rows, Stat.CRIT_CHANCE);
        Assertions.assertEquals(0, new BigDecimal("2").compareTo(crit.current())); //Solo il cappello è Incomune
        Assertions.assertEquals(0, new BigDecimal("4").compareTo(crit.top()));
    }

    @Test
    void highlightsPerColumn() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY);
        //Attuale: HP 48 unico, poi Danno 32; il minimo è 0
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.MAX_HP).currentHighlight());
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.DAMAGE).currentHighlight());
        Assertions.assertEquals(Highlight.NONE, row(rows, Stat.CRIT_CHANCE).currentHighlight());
        Assertions.assertEquals(Highlight.WORST, row(rows, Stat.LUCK).currentHighlight());
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.DAMAGE).topHighlight());
    }

    @Test
    void bonusNeedsFourPieces() {
        Assertions.assertFalse(SetStatisticsCalculator.bonusActive(3));
        Assertions.assertTrue(SetStatisticsCalculator.bonusActive(4));
        Assertions.assertTrue(SetStatisticsCalculator.bonusActive(5));
    }

    private static StatComparison row(List<StatComparison> rows, Stat stat) {
        return rows.stream().filter(r -> r.key().equals(StatKey.defaultOf(stat))).findFirst().orElseThrow();
    }
}
