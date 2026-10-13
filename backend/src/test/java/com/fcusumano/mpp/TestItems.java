package com.fcusumano.mpp;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.RarityBonus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Item di prova (dati inventati) condivisi dai test. */
public final class TestItems {

    private TestItems() {}


    public static Item armor(long id, String name, ArmorSet armorSet, Specification slot, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.ARMOR, slot, armorSet, null, rarity, level, List.of(bonuses));
    }

    public static Item weapon(long id, String name, Specification kind, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.WEAPON, kind, null, null, rarity, level, List.of(bonuses));
    }

    public static Item ability(long id, String name, Rarity rarity, int level, RarityBonus... bonuses) {
        return new Item(id, name, ItemType.ABILITY, null, null, null, rarity, level, List.of(bonuses));
    }

    /** Potenziamento nell'unità predefinita della caratteristica. */
    public static RarityBonus bonus(Rarity rarity, Stat stat, String amount) {
        return bonus(rarity, stat, stat.defaultUnit(), amount);
    }

    public static RarityBonus bonus(Rarity rarity, Stat stat, StatUnit unit, String amount) {
        return RarityBonus.of(rarity, stat, unit, new BigDecimal(amount));
    }

    /**
     * I 5 potenziamenti obbligatori del censimento: quelli dati più +1 Contraccolpo per ogni rarità mancante
     * (caratteristica che i test non controllano).
     */
    public static List<RarityBonus> allBonuses(RarityBonus... given) {
        final List<RarityBonus> bonuses = new ArrayList<>(List.of(given));
        for (Rarity rarity : Rarity.bonusRarities()) {
            if (bonuses.stream().noneMatch(bonus -> bonus.rarity() == rarity)) bonuses.add(bonus(rarity, Stat.KNOCKBACK, "1"));
        }
        return bonuses;
    }

    /** Come {@link #allBonuses(RarityBonus...)}, in JSON per le richieste REST: i potenziamenti dati sono oggetti JSON. */
    public static String allBonusesJson(String... given) {
        final List<String> bonuses = new ArrayList<>(List.of(given));
        for (Rarity rarity : Rarity.bonusRarities()) {
            if (Arrays.stream(given).noneMatch(json -> json.contains("\"%s\"".formatted(rarity)))) {
                bonuses.add("{\"rarity\": \"%s\", \"stat\": \"KNOCKBACK\", \"unit\": \"FLAT\", \"amount\": 1}".formatted(rarity));
            }
        }
        return "[" + String.join(", ", bonuses) + "]";
    }

    /** I 5 potenziamenti obbligatori di un'abilità: quelli dati più +1s Durata per ogni rarità mancante. */
    public static List<RarityBonus> abilityBonuses(RarityBonus... given) {
        final List<RarityBonus> bonuses = new ArrayList<>(List.of(given));
        for (Rarity rarity : Rarity.bonusRarities()) {
            if (bonuses.stream().noneMatch(bonus -> bonus.rarity() == rarity)) bonuses.add(bonus(rarity, Stat.DURATION, "1"));
        }
        return bonuses;
    }

    /** Come {@link #abilityBonuses(RarityBonus...)}, in JSON per le richieste REST. */
    public static String abilityBonusesJson(String... given) {
        final List<String> bonuses = new ArrayList<>(List.of(given));
        for (Rarity rarity : Rarity.bonusRarities()) {
            if (Arrays.stream(given).noneMatch(json -> json.contains("\"%s\"".formatted(rarity)))) {
                bonuses.add("{\"rarity\": \"%s\", \"stat\": \"DURATION\", \"unit\": \"SECONDS\", \"amount\": 1}".formatted(rarity));
            }
        }
        return "[" + String.join(", ", bonuses) + "]";
    }

    /** Potenziamento proprio di un'arma ("+10% al proprio danno"), nell'unità predefinita. */
    public static RarityBonus ownBonus(Rarity rarity, Stat stat, String amount) {
        return RarityBonus.ownOf(rarity, stat, stat.defaultUnit(), new BigDecimal(amount));
    }
}
