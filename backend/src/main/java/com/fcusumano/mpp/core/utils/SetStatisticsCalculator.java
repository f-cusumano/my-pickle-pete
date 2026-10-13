package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import com.fcusumano.mpp.core.utils.bo.Highlight;
import com.fcusumano.mpp.core.utils.bo.LevelStats;
import com.fcusumano.mpp.core.utils.bo.SetStatistics;
import com.fcusumano.mpp.core.utils.bo.StatComparison;
import com.fcusumano.mpp.core.utils.bo.StatHighlights;
import com.fcusumano.mpp.core.utils.bo.WeaponAdvice;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.TreeSet;

import static com.fcusumano.mpp.core.Constants.ARMOR_SET_BONUS_THRESHOLD;

/** Calcoli sulle caratteristiche di un gruppo di armature indossate insieme (Full Set e Custom Set). */
public final class SetStatisticsCalculator {

    private SetStatisticsCalculator() {}


    /**
     * Una riga per ogni caratteristica del gioco nell'unità predefinita, più una riga per ogni caratteristica
     * portata da qualche pezzo (o dall'arma) nell'altra unità; ordine fisso, con le evidenziazioni di ciascuna colonna
     * calcolate sul totale con l'arma. In fondo le caratteristiche proprie dell'arma, se ne ha.
     * I tipi di arma consigliati e sconsigliati dipendono solo dalle armature. Danno e HP dovuti al livello sono a parte.
     *
     * @param weapon arma scelta per il set, null se nessuna
     */
    public static SetStatistics compare(Collection<Item> pieces, Item weapon) {
        final SortedMap<StatKey, BigDecimal> current = complete(StatUtils.sum(pieces.stream().map(Item::currentStats).toList()), pieces);
        final SortedMap<StatKey, BigDecimal> top = complete(StatUtils.sum(pieces.stream().map(Item::topStats).toList()), pieces);
        final WeaponAdvice currentAdvice = weaponAdvice(current);
        final WeaponAdvice topAdvice = weaponAdvice(top);
        final SortedMap<StatKey, BigDecimal> weaponCurrent = weapon == null ? new TreeMap<>() : complete(weapon.currentStats(), List.of(weapon));
        final SortedMap<StatKey, BigDecimal> weaponTop = weapon == null ? new TreeMap<>() : complete(weapon.topStats(), List.of(weapon));
        weaponTop.keySet().stream().filter(key -> !key.own()).forEach(key -> {
            current.putIfAbsent(key, BigDecimal.ZERO);
            top.putIfAbsent(key, BigDecimal.ZERO);
        });
        final StatHighlights currentHighlights = StatHighlighter.highlight(withWeapon(current, weaponCurrent));
        final StatHighlights topHighlights = StatHighlighter.highlight(withWeapon(top, weaponTop));
        final List<StatComparison> rows = new ArrayList<>(top.size() + weaponTop.size());
        for (StatKey key : top.keySet()) {
            rows.add(new StatComparison(key, current.get(key), top.get(key), weaponCurrent.get(key), weaponTop.get(key),
                                        currentHighlights.highlight4(key), topHighlights.highlight4(key)));
        }
        weaponTop.keySet().stream().filter(StatKey::own).forEach(key -> rows.add(
                new StatComparison(key, weaponCurrent.get(key), weaponTop.get(key), null, null, Highlight.NONE, Highlight.NONE)));
        return new SetStatistics(rows, levelStats(pieces, weapon), currentAdvice, topAdvice);
    }

    /** Somma di Danno e HP dovuti al livello di pezzi e arma, ciascuno sulla propria caratteristica base. */
    static LevelStats levelStats(Collection<Item> pieces, Item weapon) {
        final List<Item> items = new ArrayList<>(pieces);
        if (weapon != null) items.add(weapon);
        int currentDamage = 0;
        int topDamage = 0;
        int currentHp = 0;
        int topHp = 0;
        for (Item item : items) { //Al massimo 6 elementi: ciclo classico (R30)
            if (item.baseStat() == Stat.MAX_HP) {
                currentHp += item.baseStatValue();
                topHp += item.topBaseStatValue();
            } else {
                currentDamage += item.baseStatValue();
                topDamage += item.topBaseStatValue();
            }
        }
        return new LevelStats(currentDamage, topDamage, currentHp, topHp);
    }

    /** Stesse righe nelle due colonne: un potenziamento non ancora sbloccato vale 0 nella colonna attuale. */
    private static SortedMap<StatKey, BigDecimal> complete(SortedMap<StatKey, BigDecimal> stats, Collection<Item> items) {
        final TreeSet<StatKey> keys = new TreeSet<>(stats.keySet());
        items.forEach(item -> item.bonuses().forEach(bonus -> keys.add(bonus.key())));
        keys.forEach(key -> stats.putIfAbsent(key, BigDecimal.ZERO));
        return stats;
    }

    /** Totale delle caratteristiche generali (quelle proprie dell'arma restano fuori dalle evidenziazioni). */
    private static Map<StatKey, BigDecimal> withWeapon(Map<StatKey, BigDecimal> setStats, Map<StatKey, BigDecimal> weaponStats) {
        final Map<StatKey, BigDecimal> total = new TreeMap<>(setStats);
        weaponStats.forEach((key, value) -> {
            if (!key.own()) total.merge(key, value, BigDecimal::add);
        });
        return total;
    }

    /**
     * Tipi di arma con la caratteristica di tipo più alta e più bassa (es. Danno a distanza per le armi a distanza):
     * conta prima il valore nell'unità predefinita, a parità quello nell'altra unità.
     */
    static WeaponAdvice weaponAdvice(Map<StatKey, BigDecimal> stats) {
        final Map<Specification, List<BigDecimal>> type2values = new EnumMap<>(Specification.class);
        for (Specification type : Specification.of(ItemType.WEAPON)) {
            type.weaponDamageStat().ifPresent(stat -> type2values.put(type, List.of(
                    stats.getOrDefault(StatKey.defaultOf(stat), BigDecimal.ZERO),
                    stats.getOrDefault(StatKey.otherUnitOf(stat), BigDecimal.ZERO))));
        }
        final Comparator<List<BigDecimal>> order = Comparator.<List<BigDecimal>, BigDecimal>comparing(List::getFirst).thenComparing(List::getLast);
        final List<BigDecimal> max = type2values.values().stream().max(order).orElseThrow();
        final List<BigDecimal> min = type2values.values().stream().min(order).orElseThrow();
        if (order.compare(max, min) == 0) return WeaponAdvice.none();
        return new WeaponAdvice(typesWith(type2values, max, order), typesWith(type2values, min, order));
    }

    private static List<Specification> typesWith(Map<Specification, List<BigDecimal>> type2values, List<BigDecimal> values,
                                                 Comparator<List<BigDecimal>> order) {
        return type2values.entrySet().stream().filter(entry -> order.compare(entry.getValue(), values) == 0).map(Map.Entry::getKey).toList();
    }

    /** Il bonus del set si attiva indossando almeno 4 pezzi dello stesso set. */
    public static boolean bonusActive(int piecesOfSameSet) {
        return piecesOfSameSet >= ARMOR_SET_BONUS_THRESHOLD;
    }

    /** Set con almeno 4 pezzi tra quelli indossati: con 5 slot ce ne può essere al massimo uno. */
    public static Optional<ArmorSet> activeBonus(Collection<Item> pieces) {
        final Map<ArmorSet, Integer> set2count = new EnumMap<>(ArmorSet.class);
        for (Item piece : pieces) { //Al massimo 5 pezzi: ciclo classico (R30)
            if (piece.armorSet() != null) set2count.merge(piece.armorSet(), 1, Integer::sum);
        }
        return set2count.entrySet().stream().filter(entry -> bonusActive(entry.getValue())).map(Map.Entry::getKey).findFirst();
    }
}
