package com.fcusumano.mpp.core.enums;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

class SpecificationTest {

    @Test
    void baseStatOfEverySpecification() {
        //Armi, cappello e occhiali danno Danno; gli altri slot HP
        Arrays.stream(Specification.values()).forEach(specification -> Assertions.assertEquals(switch (specification) {
            case RANGED, ELEMENTAL, MECHANICAL, MELEE, HAT, GLASSES -> Stat.DAMAGE;
            case CHEST, BACK, BOOTS -> Stat.MAX_HP;
        }, specification.baseStat(), specification.name()));
    }

    @Test
    void specificationsInDisplayOrderByType() {
        Assertions.assertEquals(List.of(Specification.RANGED, Specification.ELEMENTAL, Specification.MECHANICAL, Specification.MELEE),
                                Specification.of(ItemType.WEAPON));
        Assertions.assertEquals(List.of(Specification.HAT, Specification.GLASSES, Specification.CHEST, Specification.BACK, Specification.BOOTS),
                                Specification.of(ItemType.ARMOR));
        Assertions.assertEquals(List.of(), Specification.of(ItemType.ABILITY));
    }

    @Test
    void armorSetsInGameOrder() {
        Assertions.assertTrue(ArmorSet.KNIGHT.compareTo(ArmorSet.VAMPIRE) < 0); //Il gioco mette Cavaliere prima di Vampiro
        Assertions.assertEquals(ArmorSet.BANDIT, ArmorSet.values()[0]);
        Assertions.assertEquals(ArmorSet.VIKING, ArmorSet.values()[ArmorSet.values().length - 1]);
    }
}
