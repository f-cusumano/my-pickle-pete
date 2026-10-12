package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.ItemSortOrder;
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

/** Casi d'uso sugli item: censimento, consultazione e avanzamento di rarità e livello. */
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
    public List<Item> list(ItemSortOrder sortOrder) {
        return itemRepository.retrieveAll().stream().sorted(sortOrder.comparator()).toList();
    }

    @Transactional(readOnly = true)
    public List<Item> list() {
        return list(ItemSortOrder.defaultOrder());
    }

    @Transactional(readOnly = true)
    public Item single(long id) {
        return itemRepository.retrieve(id).orElseThrow(exception(message -> new ObjectNotFoundException(ITEM_NOT_FOUND, message),
                                                                 "Item '%s' not found.", id));
    }

    @Transactional
    public Item create(ItemDefinition definition) {
        checkUniqueness(definition, null);
        final long id = itemRepository.insert(definition);
        log.info("Item '{}' created with name '{}'", id, definition.name());
        return single(id);
    }

    @Transactional
    public Item update(long id, ItemDefinition definition) {
        final Item current = single(id);
        checkUniqueness(definition, id);
        //Cambiando slot (o tipologia) l'item non può più stare nei set custom che lo indossavano
        if (current.type() != definition.type() || current.specification() != definition.specification()) removeFromCustomSets(id);
        itemRepository.update(id, definition);
        log.info("Item '{}' updated with name '{}'", id, definition.name());
        return single(id);
    }

    @Transactional
    public void delete(long id) {
        single(id);
        removeFromCustomSets(id);
        itemRepository.delete(id);
        log.info("Item '{}' deleted", id);
    }

    @Transactional
    public Item promoteRarity(long id) {
        return saveProgress(single(id).promoted());
    }

    @Transactional
    public Item resetRarity(long id) {
        return saveProgress(single(id).reset());
    }

    @Transactional
    public Item updateLevel(long id, int level) {
        return saveProgress(single(id).withLevel(level));
    }

    private void removeFromCustomSets(long id) {
        final int removed = customSetRepository.deletePiecesOfItem(id);
        if (removed > 0) log.info("Item '{}' removed from {} custom sets", id, removed);
    }

    private Item saveProgress(Item item) {
        itemRepository.updateProgress(item.id(), item.rarity(), item.level());
        log.info("Item '{}' now at rarity '{}' and level {}/{}", item.id(), item.rarity(), item.level(), item.maxLevel());
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
