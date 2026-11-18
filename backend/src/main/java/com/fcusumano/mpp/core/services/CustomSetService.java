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
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_INVALID_ABILITY;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_INVALID_PIECES;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_INVALID_WEAPON;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_NAME_ALREADY_EXISTS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.CUSTOM_SET_NOT_FOUND;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NOT_FOUND;
import static com.fcusumano.mpp.tools.FunctionUtils.exception;

/**
 * Casi d'uso sui set custom dell'utente indicato: salvataggio, valutazione di un set non salvato e proposte
 * Best now / Best potential (senza arma né abilità), sempre con i suoi progressi.
 */
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
    public List<EvaluatedSet> list(long userId) {
        final Context context = context(userId);
        return customSetRepository.retrieveAll(userId).stream()
                .sorted(Comparator.comparing(CustomSet::name, String.CASE_INSENSITIVE_ORDER))
                .map(context::evaluate)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvaluatedSet single(long userId, long id) {
        return context(userId).evaluate(retrieve(userId, id));
    }

    @Transactional
    public EvaluatedSet create(long userId, CustomSetDefinition definition) {
        checkName(userId, definition.name(), null);
        checkItems(userId, definition);
        final long id = customSetRepository.insert(userId, definition);
        log.info("Custom set '{}' of user '{}' created with name '{}', {} pieces, weapon '{}' and ability '{}'", id, userId, definition.name(),
                 definition.itemIds().size(), definition.weaponId(), definition.abilityId());
        return single(userId, id);
    }

    @Transactional
    public EvaluatedSet update(long userId, long id, CustomSetDefinition definition) {
        retrieve(userId, id);
        checkName(userId, definition.name(), id);
        checkItems(userId, definition);
        customSetRepository.update(id, definition);
        log.info("Custom set '{}' of user '{}' updated with name '{}', {} pieces, weapon '{}' and ability '{}'", id, userId, definition.name(),
                 definition.itemIds().size(), definition.weaponId(), definition.abilityId());
        return single(userId, id);
    }

    @Transactional
    public void delete(long userId, long id) {
        retrieve(userId, id);
        customSetRepository.delete(id);
        log.info("Custom set '{}' of user '{}' deleted", id, userId);
    }

    /** Set non salvato (da zero o in modifica): stessi calcoli di un set salvato. */
    @Transactional(readOnly = true)
    public EvaluatedSet evaluate(long userId, List<Long> itemIds, Long weaponId, Long abilityId) {
        final Context context = context(userId);
        final List<Item> pieces = checkPieces(context, itemIds);
        final Item weapon = checkWeapon(context, weaponId);
        final Item ability = checkAbility(context, abilityId);
        return context.evaluate(null, null, pieces, weapon, ability);
    }

    /** Al massimo 3 set che massimizzano la caratteristica principale (e a parità la secondaria) nella configurazione scelta. */
    @Transactional(readOnly = true)
    public List<EvaluatedSet> best(long userId, ItemConfiguration configuration, StatKey primary, StatKey secondary) {
        final Context context = context(userId);
        final List<EvaluatedSet> proposals = BestSetFinder.find(context.id2item().values(), configuration, primary, secondary, BEST_SET_PROPOSALS)
                .stream()
                .map(pieces -> context.evaluate(null, null, pieces, null, null))
                .toList();
        log.info("Best sets for {} by {} then {}: {} proposals", configuration, primary, secondary, proposals.size());
        return proposals;
    }

    /** Il set di un altro utente risulta inesistente. */
    private CustomSet retrieve(long userId, long id) {
        return customSetRepository.retrieve(userId, id)
                .orElseThrow(exception(message -> new ObjectNotFoundException(CUSTOM_SET_NOT_FOUND, message), "Custom set '%s' not found.", id));
    }

    /** Nome unico tra i set dell'utente senza distinzione di maiuscole; {@code currentId} esclude il set che si sta modificando. */
    private void checkName(long userId, String name, Long currentId) {
        customSetRepository.retrieveIdByName(userId, name)
                .filter(foundId -> !foundId.equals(currentId))
                .ifPresent(foundId -> {
                    throw new ObjectAlreadyExistsException(CUSTOM_SET_NAME_ALREADY_EXISTS, "A custom set named '%s' already exists (id '%s').",
                                                           name, foundId);
                });
    }

    private void checkItems(long userId, CustomSetDefinition definition) {
        final Context context = context(userId);
        checkPieces(context, definition.itemIds());
        checkWeapon(context, definition.weaponId());
        checkAbility(context, definition.abilityId());
    }

    /** Pezzi esistenti, solo armature e al massimo uno per slot; restituisce gli item in ordine di slot. */
    private static List<Item> checkPieces(Context context, Collection<Long> itemIds) {
        final Set<Specification> takenSlots = EnumSet.noneOf(Specification.class);
        final List<Item> pieces = new ArrayList<>(itemIds.size());
        for (Long itemId : itemIds) { //Al massimo 5 pezzi: ciclo classico (R30)
            final Item item = context.id2item().get(itemId);
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

    /** Arma facoltativa: se indicata deve esistere ed essere un'arma. */
    private static Item checkWeapon(Context context, Long weaponId) {
        if (weaponId == null) return null;
        final Item weapon = retrieveItem(context, weaponId);
        if (weapon.type() != ItemType.WEAPON) {
            throw new BadRequestException(CUSTOM_SET_INVALID_WEAPON, "Item '%s' is not a weapon.", weaponId);
        }
        return weapon;
    }

    /** Abilità facoltativa: se indicata deve esistere ed essere un'abilità. */
    private static Item checkAbility(Context context, Long abilityId) {
        if (abilityId == null) return null;
        final Item ability = retrieveItem(context, abilityId);
        if (ability.type() != ItemType.ABILITY) {
            throw new BadRequestException(CUSTOM_SET_INVALID_ABILITY, "Item '%s' is not an ability.", abilityId);
        }
        return ability;
    }

    private static Item retrieveItem(Context context, long itemId) {
        final Item item = context.id2item().get(itemId);
        if (item == null) throw new ObjectNotFoundException(ITEM_NOT_FOUND, "Item '%s' not found.", itemId);
        return item;
    }

    private Context context(long userId) {
        final Map<ArmorSet, String> set2description = new EnumMap<>(ArmorSet.class);
        for (ArmorSetInfo info : armorSetRepository.retrieveAll()) {
            if (info.bonusDescription() != null) set2description.put(info.armorSet(), info.bonusDescription());
        }
        return new Context(itemRepository.retrieveAll(userId).stream().collect(Collectors.toMap(Item::id, Function.identity())), set2description);
    }

    /** Item con i progressi dell'utente e descrizioni dei bonus, letti una volta sola per tutti i set da valutare. */
    private record Context(Map<Long, Item> id2item, Map<ArmorSet, String> set2description) {

        List<Item> items(List<Long> itemIds) {
            return itemIds.stream().map(id2item::get).filter(Objects::nonNull).sorted(Comparator.comparing(Item::specification)).toList();
        }

        EvaluatedSet evaluate(CustomSet customSet) {
            return evaluate(customSet.id(), customSet.name(), items(customSet.itemIds()), item(customSet.weaponId()),
                            item(customSet.abilityId()));
        }

        EvaluatedSet evaluate(Long id, String name, List<Item> pieces, Item weapon, Item ability) {
            final ArmorSet bonusArmorSet = SetStatisticsCalculator.activeBonus(pieces).orElse(null);
            return new EvaluatedSet(id, name, pieces, weapon, ability, bonusArmorSet,
                                    bonusArmorSet == null ? null : set2description.get(bonusArmorSet),
                                    SetStatisticsCalculator.compare(pieces, weapon, ability));
        }

        private Item item(Long itemId) {
            return itemId == null ? null : id2item.get(itemId);
        }
    }
}
