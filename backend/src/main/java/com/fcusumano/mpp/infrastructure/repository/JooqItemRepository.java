package com.fcusumano.mpp.infrastructure.repository;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.enums.Stat;
import com.fcusumano.mpp.core.enums.StatUnit;
import com.fcusumano.mpp.core.model.Item;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.model.RarityBonus;
import com.fcusumano.mpp.core.repository.ItemRepository;
import com.fcusumano.mpp.infrastructure.repository.jooq.tables.records.MppItemRarityBonusRecord;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.name;
import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.valueOf;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ITEM;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ITEM_RARITY_BONUS;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER_ITEM;
import static org.jooq.impl.DSL.noCondition;
import static org.jooq.impl.DSL.selectOne;

/** Item su jOOQ: l'elenco si legge con due query (item con i progressi dell'utente e potenziamenti), mai una per item (R32). */
@Repository
public class JooqItemRepository implements ItemRepository {

    private final DSLContext dsl;


    public JooqItemRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public List<Item> retrieveAll(long userId) {
        return retrieveWhere(userId, noCondition());
    }

    @Override
    public Optional<Item> retrieve(long userId, long id) {
        return retrieveWhere(userId, MPP_ITEM.ID.eq(id)).stream().findFirst();
    }

    @Override
    public Optional<Long> retrieveIdByName(String name) {
        return dsl.select(MPP_ITEM.ID).from(MPP_ITEM).where(MPP_ITEM.NAME.equalIgnoreCase(name)).fetchOptional(MPP_ITEM.ID);
    }

    @Override
    public Optional<Long> retrieveIdByArmorSlot(ArmorSet armorSet, Specification specification) {
        return dsl.select(MPP_ITEM.ID).from(MPP_ITEM)
                .where(MPP_ITEM.ID_MPP_ARMOR_SET.eq(name(armorSet)))
                .and(MPP_ITEM.SPECIFICATION.eq(name(specification)))
                .fetchOptional(MPP_ITEM.ID);
    }

    @Override
    public long insert(ItemDefinition definition) {
        final long id = dsl.insertInto(MPP_ITEM)
                .set(MPP_ITEM.NAME, definition.name())
                .set(MPP_ITEM.ITEM_TYPE, name(definition.type()))
                .set(MPP_ITEM.SPECIFICATION, name(definition.specification()))
                .set(MPP_ITEM.ID_MPP_ARMOR_SET, name(definition.armorSet()))
                .set(MPP_ITEM.DESCRIPTION, definition.description())
                .returningResult(MPP_ITEM.ID)
                .fetchSingle(MPP_ITEM.ID);
        insertBonuses(id, definition.bonuses());
        return id;
    }

    /** I potenziamenti si sostituiscono in blocco: sono al massimo 5 e non hanno identità propria. */
    @Override
    public void update(long id, ItemDefinition definition) {
        dsl.update(MPP_ITEM)
                .set(MPP_ITEM.NAME, definition.name())
                .set(MPP_ITEM.ITEM_TYPE, name(definition.type()))
                .set(MPP_ITEM.SPECIFICATION, name(definition.specification()))
                .set(MPP_ITEM.ID_MPP_ARMOR_SET, name(definition.armorSet()))
                .set(MPP_ITEM.DESCRIPTION, definition.description())
                .where(MPP_ITEM.ID.eq(id))
                .execute();
        dsl.deleteFrom(MPP_ITEM_RARITY_BONUS).where(MPP_ITEM_RARITY_BONUS.ID_MPP_ITEM.eq(id)).execute();
        insertBonuses(id, definition.bonuses());
    }

    @Override
    public void updateProgress(long userId, long id, Rarity rarity, int level) {
        dsl.mergeInto(MPP_USER_ITEM)
                .using(selectOne())
                .on(MPP_USER_ITEM.ID_MPP_USER.eq(userId).and(MPP_USER_ITEM.ID_MPP_ITEM.eq(id)))
                .whenMatchedThenUpdate().set(MPP_USER_ITEM.RARITY, name(rarity)).set(MPP_USER_ITEM.LEVEL, level)
                .whenNotMatchedThenInsert(MPP_USER_ITEM.ID_MPP_USER, MPP_USER_ITEM.ID_MPP_ITEM, MPP_USER_ITEM.RARITY, MPP_USER_ITEM.LEVEL)
                .values(userId, id, name(rarity), level)
                .execute();
    }

    /** Nessun cascade: le righe collegate si cancellano esplicitamente (R28). */
    @Override
    public void delete(long id) {
        dsl.deleteFrom(MPP_USER_ITEM).where(MPP_USER_ITEM.ID_MPP_ITEM.eq(id)).execute();
        dsl.deleteFrom(MPP_ITEM_RARITY_BONUS).where(MPP_ITEM_RARITY_BONUS.ID_MPP_ITEM.eq(id)).execute();
        dsl.deleteFrom(MPP_ITEM).where(MPP_ITEM.ID.eq(id)).execute();
    }

    /** I progressi dell'utente arrivano con un left join: senza riga l'item vale Comune 1. */
    private List<Item> retrieveWhere(long userId, Condition where) {
        final Map<Long, List<RarityBonus>> item2bonuses = retrieveBonuses(where);
        return dsl.select(MPP_ITEM.fields())
                .select(MPP_USER_ITEM.RARITY, MPP_USER_ITEM.LEVEL)
                .from(MPP_ITEM)
                .leftJoin(MPP_USER_ITEM).on(MPP_USER_ITEM.ID_MPP_ITEM.eq(MPP_ITEM.ID).and(MPP_USER_ITEM.ID_MPP_USER.eq(userId)))
                .where(where)
                .fetch(r -> toModel(r, item2bonuses.getOrDefault(r.get(MPP_ITEM.ID), List.of())));
    }

    private Map<Long, List<RarityBonus>> retrieveBonuses(Condition itemCondition) {
        return dsl.select(MPP_ITEM_RARITY_BONUS.fields())
                .from(MPP_ITEM_RARITY_BONUS)
                .join(MPP_ITEM).on(MPP_ITEM.ID.eq(MPP_ITEM_RARITY_BONUS.ID_MPP_ITEM))
                .where(itemCondition)
                .fetchInto(MPP_ITEM_RARITY_BONUS)
                .stream()
                .collect(Collectors.groupingBy(MppItemRarityBonusRecord::getIdMppItem,
                                               Collectors.mapping(JooqItemRepository::toModel, Collectors.toList())));
    }

    private void insertBonuses(long id, List<RarityBonus> bonuses) {
        if (bonuses.isEmpty()) return;
        dsl.batchInsert(bonuses.stream().map(bonus -> toRecord(id, bonus)).toList()).execute(); //Una sola connessione (R32)
    }

    private MppItemRarityBonusRecord toRecord(long id, RarityBonus bonus) {
        final MppItemRarityBonusRecord bonusRecord = dsl.newRecord(MPP_ITEM_RARITY_BONUS);
        bonusRecord.setIdMppItem(id);
        bonusRecord.setRarity(name(bonus.rarity()));
        bonusRecord.setStat(name(bonus.stat()));
        bonusRecord.setUnit(name(bonus.unit()));
        bonusRecord.setAmount(bonus.amount());
        bonusRecord.setOwn(bonus.own());
        return bonusRecord;
    }

    private static RarityBonus toModel(MppItemRarityBonusRecord bonusRecord) {
        return new RarityBonus(valueOf(Rarity.class, bonusRecord.getRarity()), valueOf(Stat.class, bonusRecord.getStat()),
                               valueOf(StatUnit.class, bonusRecord.getUnit()), bonusRecord.getAmount(), bonusRecord.getOwn());
    }

    private static Item toModel(Record r, List<RarityBonus> bonuses) {
        return new Item(r.get(MPP_ITEM.ID),
                        r.get(MPP_ITEM.NAME),
                        valueOf(ItemType.class, r.get(MPP_ITEM.ITEM_TYPE)),
                        valueOf(Specification.class, r.get(MPP_ITEM.SPECIFICATION)),
                        valueOf(ArmorSet.class, r.get(MPP_ITEM.ID_MPP_ARMOR_SET)),
                        r.get(MPP_ITEM.DESCRIPTION),
                        r.get(MPP_USER_ITEM.RARITY) == null ? Rarity.base() : valueOf(Rarity.class, r.get(MPP_USER_ITEM.RARITY)),
                        r.get(MPP_USER_ITEM.LEVEL) == null ? 1 : r.get(MPP_USER_ITEM.LEVEL),
                        bonuses);
    }
}
