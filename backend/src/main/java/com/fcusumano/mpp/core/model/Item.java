package com.fcusumano.mpp.core.model;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.fcusumano.mpp.core.Constants.BASE_STAT_PER_LEVEL;
import static com.fcusumano.mpp.core.enums.Stat.DAMAGE;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.LEVEL_OUT_OF_RANGE;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.MAX_RARITY_REACHED;

/**
 * Item censito con la sua configurazione effettiva (rarità e livello dell'inventario).
 * La configurazione "top" è la stessa a rarità e livello massimi.
 */
public record Item(Long id,
                   String name,
                   ItemType type,
                   Specification specification,
                   ArmorSet armorSet,
                   Rarity rarity,
                   int level,
                   List<RarityBonus> bonuses,
                   OffsetDateTime imageUpdatedAt) {

    public Item {
        bonuses = bonuses == null ? List.of() : List.copyOf(bonuses);
    }

    /** Item appena censito: parte da Comune 1/10. */
    public static Item of(Long id, ItemDefinition definition) {
        return new Item(id, definition.name(), definition.type(), definition.specification(), definition.armorSet(),
                        Rarity.base(), 1, definition.bonuses(), null);
    }

    public int maxLevel() {
        return rarity.maxLevel();
    }

    public boolean hasImage() {
        return imageUpdatedAt != null;
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

    public Optional<RarityBonus> bonus4(Rarity bonusRarity) {
        return bonuses.stream().filter(b -> b.rarity() == bonusRarity).findFirst();
    }

    public boolean bonusUnlocked(RarityBonus bonus) {
        return bonus.rarity().reachedBy(rarity);
    }

    /** Caratteristiche alla rarità e al livello effettivi. */
    public Map<Stat, BigDecimal> currentStats() {
        return stats4(rarity, level);
    }

    /** Caratteristiche a rarità e livello massimi. */
    public Map<Stat, BigDecimal> topStats() {
        return stats4(Rarity.top(), Rarity.top().maxLevel());
    }

    /** Somma per caratteristica: valore base del livello più i potenziamenti delle rarità raggiunte. */
    public Map<Stat, BigDecimal> stats4(Rarity reachedRarity, int reachedLevel) {
        final Map<Stat, BigDecimal> stats = new EnumMap<>(Stat.class);
        stats.put(baseStat(), BigDecimal.valueOf(baseStatValue(reachedLevel)));
        for (RarityBonus bonus : bonuses) { //Al massimo 5 elementi: ciclo classico (R30)
            if (bonus.rarity().reachedBy(reachedRarity)) stats.merge(bonus.stat(), bonus.amount(), BigDecimal::add);
        }
        return stats;
    }

    /** Rarità successiva con lo stesso livello: sale solo il massimo. */
    public Item promoted() {
        if (rarity.isTop()) {
            throw new BadRequestException(MAX_RARITY_REACHED, "Item '%s' already has the maximum rarity '%s'.", id, rarity);
        }
        return withProgress(rarity.next(), level);
    }

    /** Ritorno a Comune: il livello scende al massimo di Comune se lo superava. */
    public Item reset() {
        return withProgress(Rarity.base(), Math.min(level, Rarity.base().maxLevel()));
    }

    public Item withLevel(int newLevel) {
        if (!rarity.levelInRange(newLevel)) {
            throw new BadRequestException(LEVEL_OUT_OF_RANGE, "Level %d of item '%s' is out of range [1, %d] for rarity '%s'.",
                                          newLevel, id, rarity.maxLevel(), rarity);
        }
        return withProgress(rarity, newLevel);
    }

    private Item withProgress(Rarity newRarity, int newLevel) {
        return new Item(id, name, type, specification, armorSet, newRarity, newLevel, bonuses, imageUpdatedAt);
    }
}
