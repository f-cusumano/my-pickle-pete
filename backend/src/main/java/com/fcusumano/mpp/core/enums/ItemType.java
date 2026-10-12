package com.fcusumano.mpp.core.enums;

import com.fcusumano.mpp.core.model.Item;

import java.util.Comparator;

import static java.util.Comparator.comparing;

/** Tipologia di item: decide quali attributi sono obbligatori e come si ordinano gli item della stessa tipologia. */
public enum ItemType {
    ARMOR(true, true),
    WEAPON(true, false),
    ABILITY(false, false);

    /** A parità di tutto il resto si ordina per nome, senza distinguere maiuscole e minuscole. */
    private static final Comparator<Item> BY_NAME = comparing(Item::name, String.CASE_INSENSITIVE_ORDER);
    private static final Comparator<Item> BY_RARITY_DESC = comparing(Item::rarity, Comparator.reverseOrder());

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
