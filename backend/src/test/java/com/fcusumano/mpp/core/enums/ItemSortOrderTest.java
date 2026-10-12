package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.fcusumano.mpp.TestItems.ability;
import static com.fcusumano.mpp.TestItems.armor;
import static com.fcusumano.mpp.TestItems.weapon;

class ItemSortOrderTest {

    private static final Item VAMPIRE_HAT = armor(1, "Cappello vampiro", ArmorSet.VAMPIRE, Specification.HAT, Rarity.COMMON, 1);
    private static final Item KNIGHT_BOOTS = armor(2, "Stivali cavaliere", ArmorSet.KNIGHT, Specification.BOOTS, Rarity.LEGENDARY, 1);
    private static final Item KNIGHT_GLASSES = armor(3, "Occhiali cavaliere", ArmorSet.KNIGHT, Specification.GLASSES, Rarity.RARE, 1);
    private static final Item RARE_PISTOL = weapon(4, "pistola", Specification.RANGED, Rarity.RARE, 1);
    private static final Item EPIC_BOW = weapon(5, "Arco", Specification.RANGED, Rarity.EPIC, 1);
    private static final Item RARE_ARC = weapon(6, "Arco", Specification.RANGED, Rarity.RARE, 1);
    private static final Item SWORD = weapon(7, "Spada", Specification.MELEE, Rarity.LEGENDARY, 1);
    private static final Item STAFF = weapon(8, "Bastone", Specification.ELEMENTAL, Rarity.COMMON, 1);
    private static final Item RARE_JAR = ability(9, "Barattolo B", Rarity.RARE, 1);
    private static final Item RARE_JAR_A = ability(10, "barattolo a", Rarity.RARE, 1);
    private static final Item EPIC_JAR = ability(11, "Barattolo C", Rarity.EPIC, 1);
    private static final List<Item> ITEMS = List.of(STAFF, RARE_JAR, SWORD, VAMPIRE_HAT, EPIC_JAR, RARE_PISTOL, KNIGHT_BOOTS, RARE_ARC,
                                                    KNIGHT_GLASSES, RARE_JAR_A, EPIC_BOW);


    @Test
    void armorSetOrder() {
        //Armature per set e slot, armi per categoria, rarità decrescente e nome, abilità per rarità decrescente e nome
        Assertions.assertEquals(List.of(KNIGHT_GLASSES, KNIGHT_BOOTS, VAMPIRE_HAT,
                                        EPIC_BOW, RARE_ARC, RARE_PISTOL, STAFF, SWORD,
                                        EPIC_JAR, RARE_JAR_A, RARE_JAR),
                                sorted(ItemSortOrder.ARMOR_SET));
    }

    @Test
    void weaponsFirstOrder() {
        Assertions.assertEquals(List.of(EPIC_BOW, RARE_ARC, RARE_PISTOL, STAFF, SWORD,
                                        EPIC_JAR, RARE_JAR_A, RARE_JAR,
                                        KNIGHT_GLASSES, KNIGHT_BOOTS, VAMPIRE_HAT),
                                sorted(ItemSortOrder.WEAPONS_FIRST));
    }

    @Test
    void rarityOrder() {
        //Rarità decrescente, poi armature < armi < abilità
        Assertions.assertEquals(List.of(KNIGHT_BOOTS, SWORD,
                                        EPIC_BOW, EPIC_JAR,
                                        KNIGHT_GLASSES, RARE_ARC, RARE_PISTOL, RARE_JAR_A, RARE_JAR,
                                        VAMPIRE_HAT, STAFF),
                                sorted(ItemSortOrder.RARITY));
    }

    @Test
    void typeOrderOfEverySortOrder() {
        for (ItemSortOrder sortOrder : ItemSortOrder.values()) {
            Assertions.assertEquals(switch (sortOrder) {
                case ARMOR_SET, RARITY -> List.of(ItemType.ARMOR, ItemType.WEAPON, ItemType.ABILITY);
                case WEAPONS_FIRST -> List.of(ItemType.WEAPON, ItemType.ABILITY, ItemType.ARMOR);
            }, sortOrder.typeOrder(), sortOrder.name());
        }
        Assertions.assertEquals(ItemSortOrder.ARMOR_SET, ItemSortOrder.defaultOrder());
    }

    private static List<Item> sorted(ItemSortOrder sortOrder) {
        return ITEMS.stream().sorted(sortOrder.comparator()).toList();
    }
}
