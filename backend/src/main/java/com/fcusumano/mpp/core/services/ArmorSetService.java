package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.model.ArmorSetInfo;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.repository.ArmorSetRepository;
import com.fcusumano.mpp.core.repository.ItemRepository;
import com.fcusumano.mpp.core.utils.SetStatisticsCalculator;
import com.fcusumano.mpp.core.utils.bo.FullSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Casi d'uso sui set di armatura: descrizione dei bonus e vista dei set completi. */
@Service
public class ArmorSetService {

    private static final Logger log = LoggerFactory.getLogger(ArmorSetService.class);

    private final ArmorSetRepository armorSetRepository;
    private final ItemRepository itemRepository;


    public ArmorSetService(ArmorSetRepository armorSetRepository, ItemRepository itemRepository) {
        this.armorSetRepository = armorSetRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<ArmorSetInfo> list() {
        return armorSetRepository.retrieveAll().stream().sorted(Comparator.comparing(ArmorSetInfo::armorSet)).toList();
    }

    @Transactional
    public ArmorSetInfo updateBonusDescription(ArmorSet armorSet, String bonusDescription) {
        final String normalized = bonusDescription == null || bonusDescription.isBlank() ? null : bonusDescription.strip();
        armorSetRepository.updateBonusDescription(armorSet, normalized);
        log.info("Bonus description of armor set '{}' updated", armorSet);
        return new ArmorSetInfo(armorSet, normalized);
    }

    /** Tutti i set nell'ordine del gioco, ciascuno con i pezzi censiti e il confronto attuale/top. */
    @Transactional(readOnly = true)
    public List<FullSet> fullSets() {
        final Map<ArmorSet, String> set2description = new EnumMap<>(ArmorSet.class);
        for (ArmorSetInfo info : armorSetRepository.retrieveAll()) set2description.put(info.armorSet(), info.bonusDescription());
        final Map<ArmorSet, List<Item>> set2pieces = armorPiecesBySet();
        final List<FullSet> fullSets = new ArrayList<>(ArmorSet.values().length);
        for (ArmorSet armorSet : ArmorSet.values()) {
            final List<Item> pieces = set2pieces.getOrDefault(armorSet, List.of());
            fullSets.add(new FullSet(armorSet, set2description.get(armorSet), SetStatisticsCalculator.bonusActive(pieces.size()),
                                     pieces, SetStatisticsCalculator.compare(pieces)));
        }
        return fullSets;
    }

    private Map<ArmorSet, List<Item>> armorPiecesBySet() {
        return itemRepository.retrieveAll().stream()
                .filter(item -> item.type() == ItemType.ARMOR)
                .sorted(Comparator.comparing(Item::specification))
                .collect(Collectors.groupingBy(Item::armorSet, () -> new EnumMap<>(ArmorSet.class), Collectors.toList()));
    }
}
