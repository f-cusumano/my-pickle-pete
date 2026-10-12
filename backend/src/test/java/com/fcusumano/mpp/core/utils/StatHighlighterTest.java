package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.utils.bo.StatHighlights;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

class StatHighlighterTest {

    @Test
    void singleTopAddsAllOccurrencesOfSecondValue() {
        final StatHighlights highlights = StatHighlighter.highlight(stats(Stat.MAX_HP, "12", Stat.DAMAGE, "8", Stat.LUCK, "8", Stat.ARMOR, "3"));
        Assertions.assertEquals(Set.of(Stat.MAX_HP, Stat.DAMAGE, Stat.LUCK), highlights.best());
    }

    @Test
    void repeatedTopStopsThere() {
        final StatHighlights highlights = StatHighlighter.highlight(stats(Stat.MAX_HP, "12", Stat.DAMAGE, "12", Stat.LUCK, "8", Stat.ARMOR, "3"));
        Assertions.assertEquals(Set.of(Stat.MAX_HP, Stat.DAMAGE), highlights.best());
    }

    @Test
    void zeroIsAlwaysTheLowestAndNeverBest() {
        //Tutte le altre caratteristiche valgono 0: sono le peggiori e lo 0 non entra tra le migliori
        final StatHighlights highlights = StatHighlighter.highlight(stats(Stat.MAX_HP, "12"));
        Assertions.assertEquals(Set.of(Stat.MAX_HP), highlights.best());
        Assertions.assertEquals(Stat.values().length - 1, highlights.worst().size());
        Assertions.assertFalse(highlights.worst().contains(Stat.MAX_HP));
    }

    @Test
    void singleLowestAddsAllOccurrencesOfSecondLowest() {
        final Map<Stat, BigDecimal> values = StatUtils.zeroStats();
        values.replaceAll((stat, value) -> BigDecimal.TEN); //Nessuno 0, tutte a 10 tranne tre
        values.put(Stat.LUCK, BigDecimal.ONE);
        values.put(Stat.ARMOR, BigDecimal.TWO);
        values.put(Stat.DAMAGE, new BigDecimal("2.00")); //Stesso valore con scala diversa
        final StatHighlights highlights = StatHighlighter.highlight(values);
        Assertions.assertEquals(Set.of(Stat.LUCK, Stat.ARMOR, Stat.DAMAGE), highlights.worst());
        Assertions.assertEquals(Stat.values().length - 3, highlights.best().size()); //Il 10 compare più volte
    }

    @Test
    void uniformColumnHighlightsNothing() {
        final StatHighlights highlights = StatHighlighter.highlight(StatUtils.zeroStats());
        Assertions.assertEquals(Set.of(), highlights.best());
        Assertions.assertEquals(Set.of(), highlights.worst());
    }

    /** Coppie caratteristica/valore sopra una base di tutte le caratteristiche a zero. */
    private static Map<Stat, BigDecimal> stats(Object... stat2value) {
        final Map<Stat, BigDecimal> values = StatUtils.zeroStats();
        for (int i = 0; i < stat2value.length; i += 2) {
            values.put((Stat) stat2value[i], new BigDecimal((String) stat2value[i + 1]));
        }
        return values;
    }
}
