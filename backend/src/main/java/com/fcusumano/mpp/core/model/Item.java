package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.SortedMap;
import java.util.TreeMap;

import static com.fcusumano.mpp.core.Constants.BASE_STAT_PER_LEVEL;
import static com.fcusumano.mpp.core.enums.Stat.DAMAGE;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.LEVEL_OUT_OF_RANGE;

/**
 * Item censito con la sua configurazione effettiva (rarità e livello dell'inventario).
 * La configurazione "top" è la stessa a rarità e livello massimi.
 */
public record Item(Long id,
                   String name,
                   ItemType type,
                   Specification specification,
                   ArmorSet armorSet,
                   String description,
                   Rarity rarity,
                   int level,
                   List<RarityBonus> bonuses) {

    public Item {
        bonuses = bonuses == null ? List.of() : List.copyOf(bonuses);
    }

    /** Item appena censito: parte da Comune 1/10. */
    public static Item of(Long id, ItemDefinition definition) {
        return new Item(id, definition.name(), definition.type(), definition.specification(), definition.armorSet(), definition.description(),
                        Rarity.base(), 1, definition.bonuses());
    }

    public int maxLevel() {
        return rarity.maxLevel();
    }

    /** Caratteristica che cresce con il livello: Danno per armi, abilità, cappelli e occhiali, HP per gli altri slot. */
    public Stat baseStat() {
        return specification == null ? DAMAGE : specification.baseStat();
    }

    public static int baseStatValue(int level) {
        return BASE_STAT_PER_LEVEL * level;
    }

    public int baseStatValue() {
        return baseStatValue(level);
    }

    /** Valore della caratteristica base al livello massimo della rarità top. */
    public int topBaseStatValue() {
        return baseStatValue(Rarity.top().maxLevel());
    }

    public Optional<RarityBonus> bonus4(Rarity bonusRarity) {
        return bonuses.stream().filter(b -> b.rarity() == bonusRarity).findFirst();
    }

    public boolean bonusUnlocked(RarityBonus bonus) {
        return bonus.rarity().reachedBy(rarity);
    }

    /** Potenziamenti sbloccati dalla rarità effettiva (senza la caratteristica base del livello). */
    public SortedMap<StatKey, BigDecimal> currentStats() {
        return stats4(rarity);
    }

    /** Potenziamenti di tutte le rarità (senza la caratteristica base del livello). */
    public SortedMap<StatKey, BigDecimal> topStats() {
        return stats4(Rarity.top());
    }

    /**
     * Somma per caratteristica e unità dei potenziamenti delle rarità raggiunte. La caratteristica base del livello
     * (Danno/HP x4) resta fuori: altrimenti sarebbe sempre il valore più alto della tabella di un set.
     */
    public SortedMap<StatKey, BigDecimal> stats4(Rarity reachedRarity) {
        final SortedMap<StatKey, BigDecimal> stats = new TreeMap<>();
        for (RarityBonus bonus : bonuses) { //Al massimo 5 elementi: ciclo classico (R30)
            if (bonus.rarity().reachedBy(reachedRarity)) stats.merge(bonus.key(), bonus.amount(), BigDecimal::add);
        }
        return stats;
    }

    /**
     * Rarità impostata direttamente (sono raggiunte anche tutte le inferiori):
     * il livello resta invariato e scende al nuovo massimo solo se lo superava.
     */
    public Item withRarity(Rarity newRarity) {
        return withProgress(newRarity, Math.min(level, newRarity.maxLevel()));
    }

    public Item withLevel(int newLevel) {
        if (!rarity.levelInRange(newLevel)) {
            throw new BadRequestException(LEVEL_OUT_OF_RANGE, "Level %d of item '%s' is out of range [1, %d] for rarity '%s'.",
                                          newLevel, id, rarity.maxLevel(), rarity);
        }
        return withProgress(rarity, newLevel);
    }

    private Item withProgress(Rarity newRarity, int newLevel) {
        return new Item(id, name, type, specification, armorSet, description, newRarity, newLevel, bonuses);
    }
}
