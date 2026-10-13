package com.fcusumano.mpp.core.validation;

import com.fcusumano.mpp.core.enums.ItemType;
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
        if (definition.description() != null && definition.type() != ItemType.ABILITY) {
            violations.add("Items of type '%s' cannot have a description.".formatted(definition.type()));
        }
        checkBonuses(definition, violations);
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

    private static void checkBonuses(ItemDefinition definition, List<String> violations) {
        final Set<Rarity> seen = EnumSet.noneOf(Rarity.class);
        for (RarityBonus bonus : definition.bonuses()) { //Al massimo 5 elementi
            if (bonus.own() && definition.type() == ItemType.ARMOR) {
                violations.add("Armor pieces cannot have own bonuses (rarity '%s').".formatted(bonus.rarity()));
            } else if (!definition.type().allowsBonus(bonus.key())) {
                violations.add("Bonus %s %s%s is not allowed for items of type '%s' (rarity '%s').".formatted(
                        bonus.stat(), bonus.unit(), bonus.own() ? " (own)" : "", definition.type(), bonus.rarity()));
            }
            if (!bonus.rarity().unlocksBonus()) {
                violations.add("Rarity '%s' does not unlock any bonus.".formatted(bonus.rarity()));
            } else if (!seen.add(bonus.rarity())) {
                violations.add("Rarity '%s' has more than one bonus.".formatted(bonus.rarity()));
            }
        }
        //Ogni rarità oltre la base sblocca un potenziamento: vanno censiti tutti
        final List<Rarity> missing = Rarity.bonusRarities().stream().filter(rarity -> !seen.contains(rarity)).toList();
        if (!missing.isEmpty()) violations.add("Bonuses are required for every rarity above the base one, missing: %s.".formatted(missing));
    }
}
