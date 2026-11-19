package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.ItemSortOrder;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.repository.CustomSetRepository;
import com.fcusumano.mpp.core.repository.ItemRepository;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.ObjectAlreadyExistsException;
import com.fcusumano.mpp.infrastructure.exception.ObjectNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ARMOR_SLOT_ALREADY_TAKEN;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NAME_ALREADY_EXISTS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NOT_FOUND;
import static com.fcusumano.mpp.tools.FunctionUtils.exception;

/**
 * Casi d'uso sugli item: censimento (dati comuni a tutti), consultazione e avanzamento di rarità e livello
 * (progressi dell'utente indicato).
 */
@Service
public class ItemService {

    private static final Logger log = LoggerFactory.getLogger(ItemService.class);

    private final ItemRepository itemRepository;
    private final CustomSetRepository customSetRepository;


    public ItemService(ItemRepository itemRepository, CustomSetRepository customSetRepository) {
        this.itemRepository = itemRepository;
        this.customSetRepository = customSetRepository;
    }

    @Transactional(readOnly = true)
    public List<Item> list(long userId, ItemSortOrder sortOrder) {
        return itemRepository.retrieveAll(userId).stream().sorted(sortOrder.comparator()).toList();
    }

    @Transactional(readOnly = true)
    public Item single(long userId, long id) {
        return itemRepository.retrieve(userId, id).orElseThrow(exception(message -> new ObjectNotFoundException(ITEM_NOT_FOUND, message),
                                                                         "Item '%s' not found.", id));
    }

    @Transactional
    public Item create(long userId, ItemDefinition definition) {
        checkUniqueness(definition, null);
        final long id = itemRepository.insert(definition);
        log.info("Item '{}' created with name '{}'", id, definition.name());
        return single(userId, id);
    }

    @Transactional
    public Item update(long userId, long id, ItemDefinition definition) {
        final Item current = single(userId, id);
        checkUniqueness(definition, id);
        //Cambiando tipologia (o slot di armatura) l'item non può più stare nei set custom che lo usavano; armi e abilità restano tali
        if (current.type() != definition.type()) removeFromCustomSets(id);
        else if (current.specification() != definition.specification()) removePieces(id);
        itemRepository.update(id, definition);
        log.info("Item '{}' updated with name '{}'", id, definition.name());
        return single(userId, id);
    }

    /** L'item sparisce dai set custom e dai progressi di tutti gli utenti. */
    @Transactional
    public void delete(long userId, long id) {
        single(userId, id);
        removeFromCustomSets(id);
        itemRepository.delete(id);
        log.info("Item '{}' deleted", id);
    }

    @Transactional
    public Item updateRarity(long userId, long id, Rarity rarity) {
        return saveProgress(userId, single(userId, id).withRarity(rarity));
    }

    @Transactional
    public Item updateLevel(long userId, long id, int level) {
        return saveProgress(userId, single(userId, id).withLevel(level));
    }

    private void removeFromCustomSets(long id) {
        removePieces(id);
        final int cleared = customSetRepository.clearWeapon(id);
        if (cleared > 0) log.info("Weapon '{}' removed from {} custom sets", id, cleared);
        final int clearedAbility = customSetRepository.clearAbility(id);
        if (clearedAbility > 0) log.info("Ability '{}' removed from {} custom sets", id, clearedAbility);
    }

    private void removePieces(long id) {
        final int removed = customSetRepository.deletePiecesOfItem(id);
        if (removed > 0) log.info("Item '{}' removed from {} custom sets", id, removed);
    }

    private Item saveProgress(long userId, Item item) {
        itemRepository.updateProgress(userId, item.id(), item.rarity(), item.level());
        log.info("Item '{}' of user '{}' now at rarity '{}' and level {}/{}", item.id(), userId, item.rarity(), item.level(), item.maxLevel());
        return item;
    }

    /** Nome unico e un solo pezzo per slot in ogni set; {@code currentId} esclude l'item che si sta modificando. */
    private void checkUniqueness(ItemDefinition definition, Long currentId) {
        itemRepository.retrieveIdByName(definition.name())
                .filter(foundId -> !foundId.equals(currentId))
                .ifPresent(foundId -> {
                    throw new ObjectAlreadyExistsException(ITEM_NAME_ALREADY_EXISTS, "An item named '%s' already exists (id '%s').",
                                                           definition.name(), foundId);
                });
        if (definition.armorSet() == null) return;
        itemRepository.retrieveIdByArmorSlot(definition.armorSet(), definition.specification())
                .filter(foundId -> !foundId.equals(currentId))
                .ifPresent(foundId -> {
                    throw new ObjectAlreadyExistsException(ARMOR_SLOT_ALREADY_TAKEN, "Armor set '%s' already has a piece for slot '%s' (id '%s').",
                                                           definition.armorSet(), definition.specification(), foundId);
                });
    }
}
