package com.fcusumano.mpp.core.enums;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

class RarityTest {

    @Test
    void maxLevelOfEveryRarity() {
        Arrays.stream(Rarity.values()).forEach(rarity -> Assertions.assertEquals(switch (rarity) {
            case COMMON -> 10;
            case UNCOMMON -> 20;
            case RARE -> 30;
            case EPIC -> 40;
            case LEGENDARY -> 50;
            case ARTIFACT -> 99;
        }, rarity.maxLevel(), rarity.name()));
    }

    @Test
    void nextRarityUntilArtifact() {
        Assertions.assertEquals(Rarity.UNCOMMON, Rarity.COMMON.next());
        Assertions.assertEquals(Rarity.ARTIFACT, Rarity.LEGENDARY.next());
        Assertions.assertTrue(Rarity.ARTIFACT.isTop());
        Assertions.assertThrows(IllegalStateException.class, Rarity.ARTIFACT::next);
    }

    @Test
    void onlyCommonUnlocksNoBonus() {
        Assertions.assertEquals(List.of(Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.ARTIFACT), Rarity.bonusRarities());
        Assertions.assertFalse(Rarity.COMMON.unlocksBonus());
    }

    @Test
    void rarityReachedByCurrentRarity() {
        Assertions.assertTrue(Rarity.RARE.reachedBy(Rarity.RARE));
        Assertions.assertTrue(Rarity.UNCOMMON.reachedBy(Rarity.EPIC));
        Assertions.assertFalse(Rarity.LEGENDARY.reachedBy(Rarity.EPIC));
    }

    @Test
    void levelRangeOfRarity() {
        Assertions.assertTrue(Rarity.COMMON.levelInRange(1));
        Assertions.assertTrue(Rarity.COMMON.levelInRange(10));
        Assertions.assertFalse(Rarity.COMMON.levelInRange(11));
        Assertions.assertFalse(Rarity.ARTIFACT.levelInRange(0));
        Assertions.assertTrue(Rarity.ARTIFACT.levelInRange(99));
    }
}
