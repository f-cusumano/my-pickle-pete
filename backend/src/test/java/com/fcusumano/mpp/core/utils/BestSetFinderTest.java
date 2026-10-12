package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemConfiguration;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static com.fcusumano.mpp.TestItems.armor;
import static com.fcusumano.mpp.TestItems.bonus;
import static com.fcusumano.mpp.TestItems.weapon;

class BestSetFinderTest {

    private static final StatKey LUCK = StatKey.defaultOf(Stat.LUCK);
    private static final StatKey CRIT = StatKey.defaultOf(Stat.CRIT_CHANCE);

    //Cowboy: Fortuna su cappello e occhiali ma solo da Raro; Vichingo: Fortuna già sbloccata sul cappello
    private static final Item COWBOY_HAT = armor(1, "Cappello cowboy", ArmorSet.COWBOY, Specification.HAT, Rarity.COMMON, 1,
                                                 bonus(Rarity.RARE, Stat.LUCK, "10"));
    private static final Item COWBOY_GLASSES = armor(2, "Occhiali cowboy", ArmorSet.COWBOY, Specification.GLASSES, Rarity.COMMON, 1,
                                                     bonus(Rarity.RARE, Stat.LUCK, "10"));
    private static final Item VIKING_HAT = armor(3, "Elmo vichingo", ArmorSet.VIKING, Specification.HAT, Rarity.UNCOMMON, 5,
                                                 bonus(Rarity.UNCOMMON, Stat.LUCK, "3"), bonus(Rarity.RARE, Stat.CRIT_CHANCE, "4"));
    private static final Item VIKING_GLASSES = armor(4, "Occhiali vichinghi", ArmorSet.VIKING, Specification.GLASSES, Rarity.COMMON, 2,
                                                     bonus(Rarity.UNCOMMON, Stat.CRIT_CHANCE, "1"));
    private static final Item VIKING_CHEST = armor(5, "Corazza vichinga", ArmorSet.VIKING, Specification.CHEST, Rarity.COMMON, 1);


    @Test
    void bestNowUsesUnlockedBonusesOnly() {
        final List<List<Item>> proposals = find(ItemConfiguration.CURRENT, LUCK, null);
        //Solo l'elmo vichingo ha Fortuna sbloccata: lo indossano le prime due proposte, la prima con gli occhiali di livello più alto
        Assertions.assertEquals(3, proposals.size());
        Assertions.assertEquals(List.of(VIKING_HAT, VIKING_GLASSES, VIKING_CHEST), proposals.get(0));
        Assertions.assertEquals(List.of(VIKING_HAT, COWBOY_GLASSES, VIKING_CHEST), proposals.get(1));
        Assertions.assertFalse(proposals.get(2).contains(VIKING_HAT));
    }

    @Test
    void bestPotentialUsesTopConfiguration() {
        final List<List<Item>> proposals = find(ItemConfiguration.TOP, LUCK, null);
        //A rarità massima i due pezzi cowboy danno 10 ciascuno
        Assertions.assertEquals(List.of(COWBOY_HAT, COWBOY_GLASSES, VIKING_CHEST), proposals.getFirst());
    }

    @Test
    void secondaryBreaksTies() {
        //Danno critico 0 per tutti a livello attuale tranne gli occhiali vichinghi (non sbloccati): conta la Fortuna, poi il Critico top
        final List<List<Item>> proposals = find(ItemConfiguration.TOP, CRIT, LUCK);
        //Critico top: elmo vichingo 4 + occhiali vichinghi 1; a parità di critico nessun'altra combinazione arriva a 5
        Assertions.assertEquals(List.of(VIKING_HAT, VIKING_GLASSES, VIKING_CHEST), proposals.getFirst());
        //Seconda proposta: elmo vichingo (critico 4, fortuna 3) con gli occhiali cowboy (fortuna 10) batte gli occhiali vichinghi senza fortuna
        Assertions.assertEquals(List.of(VIKING_HAT, COWBOY_GLASSES, VIKING_CHEST), proposals.get(1));
    }

    @Test
    void otherUnitIsAnotherStat() {
        final Item percentHat = armor(6, "Cappello fortunato", ArmorSet.JESTER, Specification.HAT, Rarity.UNCOMMON, 1,
                                      bonus(Rarity.UNCOMMON, Stat.LUCK, StatUnit.PERCENT, "50"));
        final List<Item> items = new ArrayList<>(all());
        items.add(percentHat);
        final List<List<Item>> proposals = BestSetFinder.find(items, ItemConfiguration.CURRENT, StatKey.of(Stat.LUCK, StatUnit.PERCENT), null, 1);
        Assertions.assertEquals(percentHat, proposals.getFirst().getFirst());
        Assertions.assertNotEquals(percentHat, find(ItemConfiguration.CURRENT, LUCK, null).getFirst().getFirst());
    }

    @Test
    void onlyArmorAndAtMostLimit() {
        final List<Item> items = new ArrayList<>(all());
        items.add(weapon(7, "Pistola", Specification.RANGED, Rarity.ARTIFACT, 99, bonus(Rarity.UNCOMMON, Stat.LUCK, "100")));
        final List<List<Item>> proposals = BestSetFinder.find(items, ItemConfiguration.CURRENT, LUCK, null, 10);
        Assertions.assertEquals(4, proposals.size()); //2 cappelli x 2 occhiali x 1 petto
        proposals.forEach(pieces -> Assertions.assertEquals(3, pieces.size()));
        Assertions.assertTrue(BestSetFinder.find(List.of(), ItemConfiguration.CURRENT, LUCK, null, 3).isEmpty());
    }

    @Test
    void activeSetBonusWinsTies() {
        //Stessa Fortuna (0) e stesse caratteristiche base: vince chi ha almeno 4 pezzi dello stesso set
        final Item jesterHat = armor(11, "Berretto", ArmorSet.JESTER, Specification.HAT, Rarity.COMMON, 1);
        final Item jesterBoots = armor(12, "Babbucce", ArmorSet.JESTER, Specification.BOOTS, Rarity.COMMON, 1);
        final List<Item> items = List.of(
                jesterHat, jesterBoots,
                armor(13, "Elmo", ArmorSet.VIKING, Specification.HAT, Rarity.COMMON, 1),
                armor(14, "Occhiali", ArmorSet.VIKING, Specification.GLASSES, Rarity.COMMON, 1),
                armor(15, "Corazza", ArmorSet.VIKING, Specification.CHEST, Rarity.COMMON, 1),
                armor(16, "Mantello", ArmorSet.VIKING, Specification.BACK, Rarity.COMMON, 1),
                armor(17, "Stivali", ArmorSet.VIKING, Specification.BOOTS, Rarity.COMMON, 1));
        final List<List<Item>> proposals = BestSetFinder.find(items, ItemConfiguration.CURRENT, LUCK, null, 4);
        //I pezzi giullare vengono provati per primi (ordine di nome) ma con 3 soli pezzi vichinghi il bonus non è attivo
        Assertions.assertEquals(4, proposals.size());
        Assertions.assertTrue(proposals.getLast().containsAll(List.of(jesterHat, jesterBoots)));
        proposals.subList(0, 3).forEach(pieces -> Assertions.assertTrue(SetStatisticsCalculator.activeBonus(pieces).isPresent()));
    }

    private static List<List<Item>> find(ItemConfiguration configuration, StatKey primary, StatKey secondary) {
        return BestSetFinder.find(all(), configuration, primary, secondary, 3);
    }

    private static List<Item> all() {
        return List.of(COWBOY_HAT, COWBOY_GLASSES, VIKING_HAT, VIKING_GLASSES, VIKING_CHEST);
    }
}
