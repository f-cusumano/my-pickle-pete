package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.StatKey;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

class ItemTypeTest {

    @Test
    void pierceOnlyAsOwnBonusOfAWeapon() {
        //Perforare esiste solo come "Proprio perforare" delle armi (es. Fucile a pompa Leggendario)
        Arrays.stream(ItemType.values()).forEach(type -> {
            Assertions.assertEquals(switch (type) {
                case WEAPON -> true;
                case ARMOR, ABILITY -> false;
            }, type.allowsBonus(StatKey.ownOf(Stat.PIERCE, StatUnit.FLAT)), type.name());
            Assertions.assertFalse(type.allowsBonus(StatKey.defaultOf(Stat.PIERCE)), type.name());
        });
    }

    @Test
    void pierceIsNotARowOfTheSetTables() {
        Assertions.assertFalse(Stat.general().contains(Stat.PIERCE));
        Assertions.assertTrue(Stat.PIERCE.isWeaponOwnOnly());
        Assertions.assertFalse(Stat.KNOCKBACK.isWeaponOwnOnly());
    }
}
