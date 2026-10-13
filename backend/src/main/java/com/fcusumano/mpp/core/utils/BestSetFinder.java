package com.fcusumano.mpp.core.utils;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemConfiguration;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Migliori combinazioni di armature (un pezzo per slot) per una caratteristica principale e una secondaria facoltativa.
 * Ordine delle proposte: caratteristica principale, poi secondaria (entrambe dai soli potenziamenti), poi bonus di set attivo,
 * poi somma delle caratteristiche base del livello (Danno/HP) dei pezzi; a parità resta la combinazione trovata prima, con i pezzi di rarità più alta provati per primi.
 * Al massimo 11 pezzi per slot: la ricerca esaustiva è al massimo 11^5 combinazioni, poche per una CPU.
 */
public final class BestSetFinder {

    private static final Comparator<Item> CANDIDATE_ORDER = Comparator.comparing(Item::rarity, Comparator.reverseOrder())
            .thenComparing(Item::name, String.CASE_INSENSITIVE_ORDER);
    private static final Comparator<Score> SCORE_ORDER = Comparator.comparing(Score::primary)
            .thenComparing(Score::secondary)
            .thenComparing(Score::bonusActive)
            .thenComparing(Score::base);

    private BestSetFinder() {}


    /** Proposte dalla migliore alla peggiore, ognuna con i pezzi in ordine di slot; vuota se non c'è nessuna armatura. */
    public static List<List<Item>> find(Collection<Item> items, ItemConfiguration configuration, StatKey primary, StatKey secondary, int limit) {
        Objects.requireNonNull(primary, "primary");
        final List<List<Candidate>> slots = candidatesBySlot(items, configuration, primary, Objects.equals(primary, secondary) ? null : secondary);
        if (slots.isEmpty() || limit <= 0) return List.of();
        final Search search = new Search(slots, limit);
        search.explore(0, new Candidate[slots.size()]);
        return search.best.stream().map(found -> found.pieces().stream().map(Candidate::item).toList()).toList();
    }

    /** Armature raggruppate per slot (gli slot senza pezzi censiti restano vuoti nel set). */
    private static List<List<Candidate>> candidatesBySlot(Collection<Item> items, ItemConfiguration configuration, StatKey primary, StatKey secondary) {
        final Map<Specification, List<Candidate>> slot2candidates = new EnumMap<>(Specification.class);
        items.stream()
                .filter(item -> item.type() == ItemType.ARMOR)
                .sorted(CANDIDATE_ORDER)
                .forEach(item -> slot2candidates.computeIfAbsent(item.specification(), slot -> new ArrayList<>())
                        .add(Candidate.of(item, configuration, primary, secondary)));
        return List.copyOf(slot2candidates.values());
    }

    /** Pezzo candidato con i valori che servono al confronto già estratti. */
    private record Candidate(Item item, BigDecimal primary, BigDecimal secondary, BigDecimal base) {

        static Candidate of(Item item, ItemConfiguration configuration, StatKey primary, StatKey secondary) {
            final Map<StatKey, BigDecimal> stats = configuration.stats(item);
            return new Candidate(item,
                                 stats.getOrDefault(primary, BigDecimal.ZERO),
                                 secondary == null ? BigDecimal.ZERO : stats.getOrDefault(secondary, BigDecimal.ZERO),
                                 BigDecimal.valueOf(configuration.baseStatValue(item)));
        }
    }

    private record Score(BigDecimal primary, BigDecimal secondary, boolean bonusActive, BigDecimal base) {}

    private record Found(List<Candidate> pieces, Score score) {}

    /** Visita in profondità di tutte le combinazioni, tenendo solo le migliori {@code limit}. */
    private static final class Search {

        private final List<List<Candidate>> slots;
        private final int limit;
        private final List<Found> best = new ArrayList<>();


        private Search(List<List<Candidate>> slots, int limit) {
            this.slots = slots;
            this.limit = limit;
        }

        private void explore(int slot, Candidate[] chosen) {
            if (slot == slots.size()) {
                offer(chosen);
                return;
            }
            for (Candidate candidate : slots.get(slot)) {
                chosen[slot] = candidate;
                explore(slot + 1, chosen);
            }
        }

        private void offer(Candidate[] chosen) {
            final Score score = score(chosen);
            if (best.size() == limit && SCORE_ORDER.compare(score, best.getLast().score()) <= 0) return; //A parità vince chi è arrivato prima
            int position = best.size();
            while (position > 0 && SCORE_ORDER.compare(score, best.get(position - 1).score()) > 0) position--;
            best.add(position, new Found(List.of(chosen), score));
            if (best.size() > limit) best.removeLast();
        }

        private static Score score(Candidate[] chosen) {
            BigDecimal primary = BigDecimal.ZERO;
            BigDecimal secondary = BigDecimal.ZERO;
            BigDecimal base = BigDecimal.ZERO;
            final Map<ArmorSet, Integer> set2count = new EnumMap<>(ArmorSet.class);
            boolean bonusActive = false;
            for (Candidate candidate : chosen) { //Al massimo 5 pezzi: ciclo classico (R30)
                primary = primary.add(candidate.primary());
                secondary = secondary.add(candidate.secondary());
                base = base.add(candidate.base());
                final ArmorSet armorSet = candidate.item().armorSet();
                if (armorSet != null) bonusActive |= SetStatisticsCalculator.bonusActive(set2count.merge(armorSet, 1, Integer::sum));
            }
            return new Score(primary, secondary, bonusActive, base);
        }
    }
}
