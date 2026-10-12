package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemConfiguration;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.model.ArmorSetInfo;
import com.fcusumano.mpp.core.model.CustomSet;
import com.fcusumano.mpp.core.model.CustomSetDefinition;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.StatKey;
import com.fcusumano.mpp.core.repository.ArmorSetRepository;
import com.fcusumano.mpp.core.repository.CustomSetRepository;
import com.fcusumano.mpp.core.repository.ItemRepository;
import com.fcusumano.mpp.core.utils.BestSetFinder;
import com.fcusumano.mpp.core.utils.SetStatisticsCalculator;
import com.fcusumano.mpp.core.utils.bo.EvaluatedSet;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.ObjectAlreadyExistsException;
import com.fcusumano.mpp.infrastructure.exception.ObjectNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.fcusumano.mpp.core.Constants.BEST_SET_PROPOSALS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_INVALID_PIECES;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_NAME_ALREADY_EXISTS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_NOT_FOUND;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NOT_FOUND;
import static com.fcusumano.mpp.tools.FunctionUtils.exception;

/** Casi d'uso sui set custom: salvataggio, valutazione di un set non salvato e proposte Best now / Best potential. */
@Service
public class CustomSetService {

    private static final Logger log = LoggerFactory.getLogger(CustomSetService.class);

    private final CustomSetRepository customSetRepository;
    private final ItemRepository itemRepository;
    private final ArmorSetRepository armorSetRepository;


    public CustomSetService(CustomSetRepository customSetRepository, ItemRepository itemRepository, ArmorSetRepository armorSetRepository) {
        this.customSetRepository = customSetRepository;
        this.itemRepository = itemRepository;
        this.armorSetRepository = armorSetRepository;
    }

    /** Set custom in ordine di nome. */
    @Transactional(readOnly = true)
    public List<EvaluatedSet> list() {
        final Context context = context();
        return customSetRepository.retrieveAll().stream()
                .sorted(Comparator.comparing(CustomSet::name, String.CASE_INSENSITIVE_ORDER))
                .map(customSet -> context.evaluate(customSet.id(), customSet.name(), context.items(customSet.itemIds())))
                .toList();
    }

    @Transactional(readOnly = true)
    public EvaluatedSet single(long id) {
        final CustomSet customSet = retrieve(id);
        final Context context = context();
        return context.evaluate(customSet.id(), customSet.name(), context.items(customSet.itemIds()));
    }

    @Transactional
    public EvaluatedSet create(CustomSetDefinition definition) {
        checkName(definition.name(), null);
        checkPieces(definition.itemIds());
        final long id = customSetRepository.insert(definition);
        log.info("Custom set '{}' created with name '{}' and {} pieces", id, definition.name(), definition.itemIds().size());
        return single(id);
    }

    @Transactional
    public EvaluatedSet update(long id, CustomSetDefinition definition) {
        retrieve(id);
        checkName(definition.name(), id);
        checkPieces(definition.itemIds());
        customSetRepository.update(id, definition);
        log.info("Custom set '{}' updated with name '{}' and {} pieces", id, definition.name(), definition.itemIds().size());
        return single(id);
    }

    @Transactional
    public void delete(long id) {
        retrieve(id);
        customSetRepository.delete(id);
        log.info("Custom set '{}' deleted", id);
    }

    /** Set non salvato (da zero o in modifica): stessi calcoli di un set salvato. */
    @Transactional(readOnly = true)
    public EvaluatedSet evaluate(List<Long> itemIds) {
        final List<Item> pieces = checkPieces(itemIds);
        return context().evaluate(null, null, pieces);
    }

    /** Al massimo 3 set che massimizzano la caratteristica principale (e a parità la secondaria) nella configurazione scelta. */
    @Transactional(readOnly = true)
    public List<EvaluatedSet> best(ItemConfiguration configuration, StatKey primary, StatKey secondary) {
        final Context context = context();
        final List<EvaluatedSet> proposals = BestSetFinder.find(context.id2item().values(), configuration, primary, secondary, BEST_SET_PROPOSALS)
                .stream()
                .map(pieces -> context.evaluate(null, null, pieces))
                .toList();
        log.info("Best sets for {} by {} then {}: {} proposals", configuration, primary, secondary, proposals.size());
        return proposals;
    }

    private CustomSet retrieve(long id) {
        return customSetRepository.retrieve(id).orElseThrow(exception(message -> new ObjectNotFoundException(CUSTOM_SET_NOT_FOUND, message),
                                                                      "Custom set '%s' not found.", id));
    }

    /** Nome unico senza distinzione di maiuscole; {@code currentId} esclude il set che si sta modificando. */
    private void checkName(String name, Long currentId) {
        customSetRepository.retrieveIdByName(name)
                .filter(foundId -> !foundId.equals(currentId))
                .ifPresent(foundId -> {
                    throw new ObjectAlreadyExistsException(CUSTOM_SET_NAME_ALREADY_EXISTS, "A custom set named '%s' already exists (id '%s').",
                                                           name, foundId);
                });
    }

    /** Pezzi esistenti, solo armature e al massimo uno per slot; restituisce gli item in ordine di slot. */
    private List<Item> checkPieces(Collection<Long> itemIds) {
        final Map<Long, Item> id2item = itemRepository.retrieveAll().stream().collect(Collectors.toMap(Item::id, Function.identity()));
        final Set<Specification> takenSlots = EnumSet.noneOf(Specification.class);
        final List<Item> pieces = new ArrayList<>(itemIds.size());
        for (Long itemId : itemIds) { //Al massimo 5 pezzi: ciclo classico (R30)
            final Item item = id2item.get(itemId);
            if (item == null) throw new ObjectNotFoundException(ITEM_NOT_FOUND, "Item '%s' not found.", itemId);
            if (item.type() != ItemType.ARMOR) {
                throw new BadRequestException(CUSTOM_SET_INVALID_PIECES, "Item '%s' is not an armor piece.", itemId);
            }
            if (!takenSlots.add(item.specification())) {
                throw new BadRequestException(CUSTOM_SET_INVALID_PIECES, "Slot '%s' is used by more than one piece.", item.specification());
            }
            pieces.add(item);
        }
        pieces.sort(Comparator.comparing(Item::specification));
        return pieces;
    }

    private Context context() {
        final Map<ArmorSet, String> set2description = new EnumMap<>(ArmorSet.class);
        for (ArmorSetInfo info : armorSetRepository.retrieveAll()) {
            if (info.bonusDescription() != null) set2description.put(info.armorSet(), info.bonusDescription());
        }
        return new Context(itemRepository.retrieveAll().stream().collect(Collectors.toMap(Item::id, Function.identity())), set2description);
    }

    /** Item e descrizioni dei bonus letti una volta sola per tutti i set da valutare. */
    private record Context(Map<Long, Item> id2item, Map<ArmorSet, String> set2description) {

        List<Item> items(List<Long> itemIds) {
            return itemIds.stream().map(id2item::get).filter(Objects::nonNull).sorted(Comparator.comparing(Item::specification)).toList();
        }

        EvaluatedSet evaluate(Long id, String name, List<Item> pieces) {
            final ArmorSet bonusArmorSet = SetStatisticsCalculator.activeBonus(pieces).orElse(null);
            return new EvaluatedSet(id, name, pieces, bonusArmorSet, bonusArmorSet == null ? null : set2description.get(bonusArmorSet),
                                    SetStatisticsCalculator.compare(pieces));
        }
    }
}
