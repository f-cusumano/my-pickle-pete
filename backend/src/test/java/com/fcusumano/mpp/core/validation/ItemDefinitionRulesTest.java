package com.fcusumano.mpp.core.validation;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.model.RarityBonus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.fcusumano.mpp.TestItems.allBonuses;
import static com.fcusumano.mpp.TestItems.bonus;
import static com.fcusumano.mpp.TestItems.ownBonus;

class ItemDefinitionRulesTest {

    @Test
    void consistentDefinitionsHaveNoViolations() {
        Assertions.assertEquals(List.of(), violations(ItemType.ARMOR, Specification.HAT, ArmorSet.WIZARD));
        Assertions.assertEquals(List.of(), violations(ItemType.WEAPON, Specification.MELEE, null));
        Assertions.assertEquals(List.of(), violations(ItemType.ABILITY, null, null));
    }

    @Test
    void specificationMustMatchType() {
        Assertions.assertEquals(1, violations(ItemType.ARMOR, Specification.MELEE, ArmorSet.WIZARD).size());
        Assertions.assertEquals(1, violations(ItemType.WEAPON, null, null).size());
        Assertions.assertEquals(1, violations(ItemType.ABILITY, Specification.RANGED, null).size());
    }

    @Test
    void armorSetOnlyForArmor() {
        Assertions.assertEquals(1, violations(ItemType.ARMOR, Specification.BOOTS, null).size());
        Assertions.assertEquals(1, violations(ItemType.WEAPON, Specification.RANGED, ArmorSet.BANKER).size());
    }

    @Test
    void allViolationsCollectedTogether() {
        //Abilità con specifica e set: due violazioni nello stesso messaggio di risposta
        Assertions.assertEquals(2, violations(ItemType.ABILITY, Specification.HAT, ArmorSet.BANKER).size());
    }

    @Test
    void bonusesOnlyOnePerUnlockingRarity() {
        final List<RarityBonus> bonuses = allBonuses(bonus(Rarity.COMMON, Stat.LUCK, "1"), bonus(Rarity.RARE, Stat.LUCK, "1"), bonus(Rarity.RARE, Stat.ARMOR, "2"));
        Assertions.assertEquals(2, ItemDefinitionRules.violations(new ItemDefinition("Barattolo", ItemType.ABILITY, null, null, bonuses)).size());
    }

    @Test
    void bonusesRequiredForEveryRarityAboveTheBase() {
        final List<RarityBonus> bonuses = List.of(bonus(Rarity.UNCOMMON, Stat.LUCK, "1"), bonus(Rarity.RARE, Stat.LUCK, "1"));
        Assertions.assertEquals(List.of("Bonuses are required for every rarity above the base one, missing: [EPIC, LEGENDARY, ARTIFACT]."),
                                ItemDefinitionRules.violations(new ItemDefinition("Barattolo", ItemType.ABILITY, null, null, bonuses)));
    }

    @Test
    void ownBonusesOnlyForWeapons() {
        final List<RarityBonus> bonuses = allBonuses(ownBonus(Rarity.RARE, Stat.DAMAGE, "10"));
        Assertions.assertEquals(List.of(), ItemDefinitionRules.violations(new ItemDefinition("Pistola", ItemType.WEAPON, Specification.RANGED, null, bonuses)));
        Assertions.assertEquals(1, ItemDefinitionRules.violations(new ItemDefinition("Elmo", ItemType.ARMOR, Specification.HAT, ArmorSet.VIKING, bonuses)).size());
    }

    private static List<String> violations(ItemType type, Specification specification, ArmorSet armorSet) {
        return ItemDefinitionRules.violations(new ItemDefinition("Item", type, specification, armorSet, allBonuses()));
    }
}
