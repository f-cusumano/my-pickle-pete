package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import com.fcusumano.mpp.core.utils.bo.Highlight;
import com.fcusumano.mpp.core.utils.bo.LevelStats;
import com.fcusumano.mpp.core.utils.bo.SetStatistics;
import com.fcusumano.mpp.core.utils.bo.StatComparison;
import com.fcusumano.mpp.core.utils.bo.WeaponAdvice;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static com.fcusumano.mpp.TestItems.armor;
import static com.fcusumano.mpp.TestItems.bonus;
import static com.fcusumano.mpp.TestItems.ownBonus;
import static com.fcusumano.mpp.TestItems.weapon;

class SetStatisticsCalculatorTest {

    private static final List<Item> COWBOY = List.of(
            armor(1, "Cappello", ArmorSet.COWBOY, Specification.HAT, Rarity.UNCOMMON, 5, bonus(Rarity.UNCOMMON, Stat.CRIT_CHANCE, "2")),
            armor(2, "Occhiali", ArmorSet.COWBOY, Specification.GLASSES, Rarity.COMMON, 3, bonus(Rarity.UNCOMMON, Stat.CRIT_CHANCE, "2")),
            armor(3, "Petto", ArmorSet.COWBOY, Specification.CHEST, Rarity.UNCOMMON, 10,
                  bonus(Rarity.UNCOMMON, Stat.MAX_HP, "5"), bonus(Rarity.RARE, Stat.ARMOR, "3")),
            armor(4, "Schiena", ArmorSet.COWBOY, Specification.BACK, Rarity.COMMON, 1),
            armor(5, "Stivali", ArmorSet.COWBOY, Specification.BOOTS, Rarity.COMMON, 1));


    @Test
    void oneRowPerStatInFixedOrder() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY, null).rows();
        Assertions.assertEquals(Arrays.stream(Stat.values()).map(StatKey::defaultOf).toList(), rows.stream().map(StatComparison::key).toList());
    }

    @Test
    void otherUnitAddsItsOwnRowEvenIfStillLocked() {
        final Item glasses = armor(6, "Occhiali", ArmorSet.VIKING, Specification.GLASSES, Rarity.COMMON, 1,
                                   bonus(Rarity.RARE, Stat.LUCK, StatUnit.PERCENT, "5"));
        final List<StatComparison> rows = SetStatisticsCalculator.compare(List.of(glasses), null).rows();
        Assertions.assertEquals(Stat.values().length + 1, rows.size());
        final StatComparison luckPercent = rows.stream().filter(r -> r.key().equals(StatKey.of(Stat.LUCK, StatUnit.PERCENT))).findFirst().orElseThrow();
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(luckPercent.current())); //Raro non ancora raggiunto
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(luckPercent.top()));
        //Subito dopo la Fortuna nella sua unità predefinita
        Assertions.assertEquals(StatKey.defaultOf(Stat.LUCK), rows.get(rows.indexOf(luckPercent) - 1).key());
    }

    @Test
    void currentAndTopSumsOnlyBonuses() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY, null).rows();
        final StatComparison crit = row(rows, Stat.CRIT_CHANCE);
        Assertions.assertEquals(0, new BigDecimal("2").compareTo(crit.current())); //Solo il cappello è Incomune
        Assertions.assertEquals(0, new BigDecimal("4").compareTo(crit.top()));
        final StatComparison armor = row(rows, Stat.ARMOR);
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(armor.current())); //Raro non ancora raggiunto
        Assertions.assertEquals(0, new BigDecimal("3").compareTo(armor.top()));
        //Danno e HP del livello stanno fuori dalla tabella: restano solo i potenziamenti
        final StatComparison hp = row(rows, Stat.MAX_HP);
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(hp.current()));
        Assertions.assertEquals(0, new BigDecimal("5").compareTo(hp.top()));
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(row(rows, Stat.DAMAGE).top()));
    }

    @Test
    void levelStatsSumBaseStatsOfPiecesAndWeapon() {
        Assertions.assertEquals(new LevelStats(32, 792, 48, 1188), //Danno 4 x (5 + 3) e 2 x 4 x 99, HP 4 x (10 + 1 + 1) e 3 x 4 x 99
                                SetStatisticsCalculator.compare(COWBOY, null).levelStats());
        final Item pistol = weapon(8, "Pistola", Specification.RANGED, Rarity.UNCOMMON, 2);
        Assertions.assertEquals(new LevelStats(40, 1188, 48, 1188), SetStatisticsCalculator.compare(COWBOY, pistol).levelStats());
        Assertions.assertEquals(new LevelStats(0, 0, 0, 0), SetStatisticsCalculator.compare(List.of(), null).levelStats());
    }

    @Test
    void highlightsPerColumn() {
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY, null).rows();
        //Attuale: HP 5 unico, poi Critico 2; il minimo è 0
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.MAX_HP).currentHighlight());
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.CRIT_CHANCE).currentHighlight());
        Assertions.assertEquals(Highlight.WORST, row(rows, Stat.ARMOR).currentHighlight());
        Assertions.assertEquals(Highlight.WORST, row(rows, Stat.DAMAGE).currentHighlight());
        //Top: HP 5 unico, poi Critico 4; l'Armatura (3) non è evidenziata
        Assertions.assertEquals(Highlight.BEST, row(rows, Stat.CRIT_CHANCE).topHighlight());
        Assertions.assertEquals(Highlight.NONE, row(rows, Stat.ARMOR).topHighlight());
    }

    @Test
    void weaponValuesStaySeparateButCountForHighlights() {
        //Arma Incomune 1/20: +3 Fortuna sbloccata, +10% al proprio danno ancora bloccato al Raro
        final Item pistol = weapon(8, "Pistola", Specification.RANGED, Rarity.UNCOMMON, 1,
                                   bonus(Rarity.UNCOMMON, Stat.LUCK, "3"), ownBonus(Rarity.RARE, Stat.DAMAGE, "10"));
        final List<StatComparison> rows = SetStatisticsCalculator.compare(COWBOY, pistol).rows();
        final StatComparison luck = row(rows, Stat.LUCK);
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(luck.current())); //Il set da solo
        Assertions.assertEquals(0, new BigDecimal("3").compareTo(luck.weaponCurrent()));
        //Senza arma la Fortuna (0) sarebbe tra i minimi; col totale vale 3, secondo valore dopo gli HP (5)
        Assertions.assertEquals(Highlight.BEST, luck.currentHighlight());
        Assertions.assertNull(row(rows, Stat.CRIT_CHANCE).weaponCurrent()); //L'arma non porta la caratteristica
        Assertions.assertNull(row(rows, Stat.DAMAGE).weaponCurrent()); //Il Danno del livello sta fuori dalla tabella
        //In fondo la riga propria dell'arma, con i soli valori dell'arma e senza evidenziazione
        final StatComparison own = rows.getLast();
        Assertions.assertEquals(StatKey.ownOf(Stat.DAMAGE, StatUnit.PERCENT), own.key());
        Assertions.assertEquals(0, BigDecimal.ZERO.compareTo(own.current()));
        Assertions.assertEquals(0, new BigDecimal("10").compareTo(own.top()));
        Assertions.assertNull(own.weaponCurrent());
        Assertions.assertEquals(Highlight.NONE, own.topHighlight());
        Assertions.assertEquals(Stat.values().length + 1, rows.size());
    }

    @Test
    void weaponTypesFollowTheSetOnly() {
        final Item hat = armor(9, "Cappello", ArmorSet.WIZARD, Specification.HAT, Rarity.UNCOMMON, 1,
                               bonus(Rarity.UNCOMMON, Stat.ELEMENTAL_DAMAGE, "3"));
        final Item glasses = armor(10, "Occhiali", ArmorSet.WIZARD, Specification.GLASSES, Rarity.UNCOMMON, 1,
                                   bonus(Rarity.UNCOMMON, Stat.MELEE_DAMAGE, "1"), bonus(Rarity.RARE, Stat.RANGED_DAMAGE, "3"));
        final Item melee = weapon(11, "Daga", Specification.MELEE, Rarity.UNCOMMON, 1, bonus(Rarity.UNCOMMON, Stat.MELEE_DAMAGE, "9"));
        final SetStatistics statistics = SetStatisticsCalculator.compare(List.of(hat, glasses), melee);
        //Attuale: Elementale 3, Ravvicinata 1, le altre 0
        Assertions.assertEquals(List.of(Specification.ELEMENTAL), statistics.currentAdvice().recommended());
        Assertions.assertEquals(List.of(Specification.RANGED, Specification.MECHANICAL), statistics.currentAdvice().discouraged());
        //Top: Distanza ed Elementale a pari merito, Meccanica a 0
        Assertions.assertEquals(List.of(Specification.RANGED, Specification.ELEMENTAL), statistics.topAdvice().recommended());
        Assertions.assertEquals(List.of(Specification.MECHANICAL), statistics.topAdvice().discouraged());
    }

    @Test
    void weaponTypesUseTheOtherUnitOnlyToBreakTies() {
        final Item hat = armor(12, "Cappello", ArmorSet.WIZARD, Specification.HAT, Rarity.UNCOMMON, 1,
                               bonus(Rarity.UNCOMMON, Stat.MECHANICAL_DAMAGE, StatUnit.PERCENT, "5"));
        final SetStatistics statistics = SetStatisticsCalculator.compare(List.of(hat), null);
        Assertions.assertEquals(List.of(Specification.MECHANICAL), statistics.currentAdvice().recommended());
        Assertions.assertEquals(List.of(Specification.RANGED, Specification.ELEMENTAL, Specification.MELEE),
                                statistics.currentAdvice().discouraged());
        //Nessun pezzo: tutti pari, nessun consiglio
        Assertions.assertEquals(WeaponAdvice.none(), SetStatisticsCalculator.compare(List.of(), null).currentAdvice());
    }

    @Test
    void bonusNeedsFourPieces() {
        Assertions.assertFalse(SetStatisticsCalculator.bonusActive(3));
        Assertions.assertTrue(SetStatisticsCalculator.bonusActive(4));
        Assertions.assertTrue(SetStatisticsCalculator.bonusActive(5));
    }

    @Test
    void activeBonusIsTheSetWithFourPieces() {
        Assertions.assertEquals(ArmorSet.COWBOY, SetStatisticsCalculator.activeBonus(COWBOY).orElseThrow());
        final Item vikingBoots = armor(7, "Stivali vichinghi", ArmorSet.VIKING, Specification.BOOTS, Rarity.COMMON, 1);
        Assertions.assertEquals(ArmorSet.COWBOY, SetStatisticsCalculator.activeBonus(List.of(COWBOY.get(0), COWBOY.get(1), COWBOY.get(2), COWBOY.get(3), vikingBoots))
                .orElseThrow());
        Assertions.assertTrue(SetStatisticsCalculator.activeBonus(List.of(COWBOY.get(0), COWBOY.get(1), COWBOY.get(2), vikingBoots)).isEmpty());
    }

    private static StatComparison row(List<StatComparison> rows, Stat stat) {
        return rows.stream().filter(r -> r.key().equals(StatKey.defaultOf(stat))).findFirst().orElseThrow();
    }
}
