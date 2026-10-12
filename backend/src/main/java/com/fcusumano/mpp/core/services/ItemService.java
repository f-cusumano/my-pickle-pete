package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.ItemSortOrder;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.model.ItemImage;
import com.fcusumano.mpp.core.repository.ItemRepository;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.ObjectAlreadyExistsException;
import com.fcusumano.mpp.infrastructure.exception.ObjectNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;

import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ARMOR_SLOT_ALREADY_TAKEN;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.IMAGE_NOT_FOUND;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.IMAGE_NOT_VALID;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NAME_ALREADY_EXISTS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.ITEM_NOT_FOUND;
import static com.fcusumano.mpp.tools.FunctionUtils.exception;

/** Casi d'uso sugli item: censimento, consultazione e avanzamento di rarità e livello. */
@Service
public class ItemService {

    private static final Logger log = LoggerFactory.getLogger(ItemService.class);
    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/webp", "image/gif");

    private final ItemRepository itemRepository;


    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
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
        single(id);
        checkUniqueness(definition, id);
        itemRepository.update(id, definition);
        log.info("Item '{}' updated with name '{}'", id, definition.name());
        return single(id);
    }

    @Transactional
    public void delete(long id) {
        single(id);
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

    @Transactional(readOnly = true)
    public ItemImage image(long id) {
        return itemRepository.retrieveImage(id).orElseThrow(exception(message -> new ObjectNotFoundException(IMAGE_NOT_FOUND, message),
                                                                      "Item '%s' has no image.", id));
    }

    @Transactional
    public Item saveImage(long id, String contentType, byte[] data) {
        single(id);
        if (contentType == null || !IMAGE_CONTENT_TYPES.contains(contentType) || data == null || data.length == 0) {
            throw new BadRequestException(IMAGE_NOT_VALID, "Image of item '%s' must be a non empty file of type %s, received '%s'.",
                                          id, IMAGE_CONTENT_TYPES, contentType);
        }
        itemRepository.saveImage(id, new ItemImage(contentType, data, OffsetDateTime.now(ZoneOffset.UTC)));
        log.info("Image of item '{}' saved ({} bytes)", id, data.length);
        return single(id);
    }

    @Transactional
    public Item deleteImage(long id) {
        single(id);
        itemRepository.deleteImage(id);
        log.info("Image of item '{}' deleted", id);
        return single(id);
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
