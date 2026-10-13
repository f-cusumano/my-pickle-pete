package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;

import java.util.Comparator;
import java.util.List;

import static java.util.Comparator.comparing;

/**
 * Tipologia di item: decide quali attributi sono obbligatori, quali potenziamenti può avere
 * e come si ordinano gli item della stessa tipologia.
 */
public enum ItemType {
    ARMOR(true, true),
    WEAPON(true, false),
    ABILITY(false, false);

    /** A parità di tutto il resto si ordina per nome, senza distinguere maiuscole e minuscole. */
    private static final Comparator<Item> BY_NAME = comparing(Item::name, String.CASE_INSENSITIVE_ORDER);
    private static final Comparator<Item> BY_RARITY_DESC = comparing(Item::rarity, Comparator.reverseOrder());
    private static final List<StatKey> ABILITY_BONUS_KEYS = List.of(StatKey.defaultOf(Stat.COOLDOWN),
                                                                    StatKey.defaultOf(Stat.DURATION),
                                                                    StatKey.defaultOf(Stat.DAMAGE),
                                                                    StatKey.ownOf(Stat.DAMAGE, StatUnit.PERCENT),
                                                                    StatKey.defaultOf(Stat.ACTION_RADIUS));

    private final boolean specified;
    private final boolean partOfArmorSet;


    ItemType(boolean specified, boolean partOfArmorSet) {
        this.specified = specified;
        this.partOfArmorSet = partOfArmorSet;
    }

    /** {@code true} se l'item deve avere una specifica (categoria dell'arma o slot dell'armatura). */
    public boolean isSpecified() {
        return specified;
    }

    /** {@code true} se l'item appartiene obbligatoriamente a un set. */
    public boolean isPartOfArmorSet() {
        return partOfArmorSet;
    }

    /**
     * Potenziamenti possibili quando sono un elenco chiuso (abilità), nell'ordine in cui si mostrano;
     * vuoto per armature e armi, che scelgono tra le caratteristiche generali.
     */
    public List<StatKey> fixedBonusKeys() {
        return this == ABILITY ? ABILITY_BONUS_KEYS : List.of();
    }

    /** Armature: caratteristiche generali; armi: anche le proprie; abilità: solo il loro elenco chiuso. */
    public boolean allowsBonus(StatKey key) {
        return switch (this) {
            case ARMOR -> key.stat().isGeneral() && StatUnit.GENERAL.contains(key.unit()) && !key.own();
            case WEAPON -> key.stat().isGeneral() && StatUnit.GENERAL.contains(key.unit());
            case ABILITY -> ABILITY_BONUS_KEYS.contains(key);
        };
    }

    /**
     * Ordine tra item di questa tipologia: armature per set e slot, armi per categoria e rarità decrescente,
     * abilità per rarità decrescente; il nome chiude sempre.
     */
    public Comparator<Item> detailComparator() {
        return switch (this) {
            case ARMOR -> comparing(Item::armorSet).thenComparing(Item::specification).thenComparing(BY_RARITY_DESC).thenComparing(BY_NAME);
            case WEAPON -> comparing(Item::specification).thenComparing(BY_RARITY_DESC).thenComparing(BY_NAME);
            case ABILITY -> BY_RARITY_DESC.thenComparing(BY_NAME);
        };
    }
}
