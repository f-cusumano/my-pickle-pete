package com.fcusumano.mpp.core.validation;

import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.model.RarityBonus;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/** Regole di coerenza tra i campi di un item censito: raccoglie tutte le violazioni invece di fermarsi alla prima. */
public final class ItemDefinitionRules {

    private ItemDefinitionRules() {}


    public static List<String> violations(ItemDefinition definition) {
        final List<String> violations = new ArrayList<>();
        if (definition.type() == null) return violations; //Lo segnala già @NotNull sul tipo
        checkSpecification(definition, violations);
        checkArmorSet(definition, violations);
        checkBonuses(definition.bonuses(), violations);
        return violations;
    }

    private static void checkSpecification(ItemDefinition definition, List<String> violations) {
        if (!definition.type().isSpecified()) {
            if (definition.specification() != null) {
                violations.add("Items of type '%s' cannot have a specification.".formatted(definition.type()));
            }
            return;
        }
        if (definition.specification() == null) {
            violations.add("Items of type '%s' require a specification.".formatted(definition.type()));
        } else if (!definition.specification().appliesTo(definition.type())) {
            violations.add("Specification '%s' does not apply to items of type '%s'.".formatted(definition.specification(), definition.type()));
        }
    }

    private static void checkArmorSet(ItemDefinition definition, List<String> violations) {
        if (definition.type().isPartOfArmorSet() && definition.armorSet() == null) {
            violations.add("Items of type '%s' require an armor set.".formatted(definition.type()));
        } else if (!definition.type().isPartOfArmorSet() && definition.armorSet() != null) {
            violations.add("Items of type '%s' cannot belong to an armor set.".formatted(definition.type()));
        }
    }

    private static void checkBonuses(List<RarityBonus> bonuses, List<String> violations) {
        final Set<Rarity> seen = EnumSet.noneOf(Rarity.class);
        for (RarityBonus bonus : bonuses) { //Al massimo 5 elementi
            if (!bonus.rarity().unlocksBonus()) {
                violations.add("Rarity '%s' does not unlock any bonus.".formatted(bonus.rarity()));
            } else if (!seen.add(bonus.rarity())) {
                violations.add("Rarity '%s' has more than one bonus.".formatted(bonus.rarity()));
            }
        }
    }
}
