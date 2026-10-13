package com.fcusumano.mpp.infrastructure.repository;

import com.fcusumano.mpp.core.model.CustomSet;
import com.fcusumano.mpp.core.model.CustomSetDefinition;
import com.fcusumano.mpp.core.repository.CustomSetRepository;
import com.fcusumano.mpp.infrastructure.repository.jooq.tables.records.MppCustomSetPieceRecord;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_CUSTOM_SET;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_CUSTOM_SET_PIECE;
import static org.jooq.impl.DSL.noCondition;

/** Set custom su jOOQ: l'elenco si legge con due query (set con arma e abilità, poi pezzi), mai una per set (R32). */
@Repository
public class JooqCustomSetRepository implements CustomSetRepository {

    private final DSLContext dsl;


    public JooqCustomSetRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public List<CustomSet> retrieveAll() {
        return retrieveWhere(noCondition());
    }

    @Override
    public Optional<CustomSet> retrieve(long id) {
        return retrieveWhere(MPP_CUSTOM_SET.ID.eq(id)).stream().findFirst();
    }

    @Override
    public Optional<Long> retrieveIdByName(String name) {
        return dsl.select(MPP_CUSTOM_SET.ID).from(MPP_CUSTOM_SET).where(MPP_CUSTOM_SET.NAME.equalIgnoreCase(name)).fetchOptional(MPP_CUSTOM_SET.ID);
    }

    @Override
    public long insert(CustomSetDefinition definition) {
        final long id = dsl.insertInto(MPP_CUSTOM_SET)
                .set(MPP_CUSTOM_SET.NAME, definition.name())
                .set(MPP_CUSTOM_SET.ID_MPP_ITEM_WEAPON, definition.weaponId())
                .set(MPP_CUSTOM_SET.ID_MPP_ITEM_ABILITY, definition.abilityId())
                .returningResult(MPP_CUSTOM_SET.ID)
                .fetchSingle(MPP_CUSTOM_SET.ID);
        insertPieces(id, definition.itemIds());
        return id;
    }

    /** I pezzi si sostituiscono in blocco: sono al massimo 5 e non hanno identità propria. */
    @Override
    public void update(long id, CustomSetDefinition definition) {
        dsl.update(MPP_CUSTOM_SET)
                .set(MPP_CUSTOM_SET.NAME, definition.name())
                .set(MPP_CUSTOM_SET.ID_MPP_ITEM_WEAPON, definition.weaponId())
                .set(MPP_CUSTOM_SET.ID_MPP_ITEM_ABILITY, definition.abilityId())
                .where(MPP_CUSTOM_SET.ID.eq(id))
                .execute();
        dsl.deleteFrom(MPP_CUSTOM_SET_PIECE).where(MPP_CUSTOM_SET_PIECE.ID_MPP_CUSTOM_SET.eq(id)).execute();
        insertPieces(id, definition.itemIds());
    }

    /** Nessun cascade: i pezzi si cancellano esplicitamente (R28). */
    @Override
    public void delete(long id) {
        dsl.deleteFrom(MPP_CUSTOM_SET_PIECE).where(MPP_CUSTOM_SET_PIECE.ID_MPP_CUSTOM_SET.eq(id)).execute();
        dsl.deleteFrom(MPP_CUSTOM_SET).where(MPP_CUSTOM_SET.ID.eq(id)).execute();
    }

    @Override
    public int deletePiecesOfItem(long itemId) {
        return dsl.deleteFrom(MPP_CUSTOM_SET_PIECE).where(MPP_CUSTOM_SET_PIECE.ID_MPP_ITEM.eq(itemId)).execute();
    }

    @Override
    public int clearWeapon(long itemId) {
        return dsl.update(MPP_CUSTOM_SET)
                .setNull(MPP_CUSTOM_SET.ID_MPP_ITEM_WEAPON)
                .where(MPP_CUSTOM_SET.ID_MPP_ITEM_WEAPON.eq(itemId))
                .execute();
    }

    @Override
    public int clearAbility(long itemId) {
        return dsl.update(MPP_CUSTOM_SET)
                .setNull(MPP_CUSTOM_SET.ID_MPP_ITEM_ABILITY)
                .where(MPP_CUSTOM_SET.ID_MPP_ITEM_ABILITY.eq(itemId))
                .execute();
    }

    private List<CustomSet> retrieveWhere(Condition condition) {
        final Map<Long, List<Long>> set2items = dsl.select(MPP_CUSTOM_SET_PIECE.fields())
                .from(MPP_CUSTOM_SET_PIECE)
                .join(MPP_CUSTOM_SET).on(MPP_CUSTOM_SET.ID.eq(MPP_CUSTOM_SET_PIECE.ID_MPP_CUSTOM_SET))
                .where(condition)
                .fetchInto(MPP_CUSTOM_SET_PIECE)
                .stream()
                .collect(Collectors.groupingBy(MppCustomSetPieceRecord::getIdMppCustomSet,
                                               Collectors.mapping(MppCustomSetPieceRecord::getIdMppItem, Collectors.toList())));
        return dsl.selectFrom(MPP_CUSTOM_SET)
                .where(condition)
                .fetch(r -> new CustomSet(r.getId(), r.getName(), set2items.getOrDefault(r.getId(), List.of()), r.getIdMppItemWeapon(),
                                         r.getIdMppItemAbility()));
    }

    private void insertPieces(long id, List<Long> itemIds) {
        if (itemIds.isEmpty()) return;
        dsl.batchInsert(itemIds.stream().map(itemId -> {
            final MppCustomSetPieceRecord pieceRecord = dsl.newRecord(MPP_CUSTOM_SET_PIECE);
            pieceRecord.setIdMppCustomSet(id);
            pieceRecord.setIdMppItem(itemId);
            return pieceRecord;
        }).toList()).execute(); //Una sola connessione (R32)
    }
}
