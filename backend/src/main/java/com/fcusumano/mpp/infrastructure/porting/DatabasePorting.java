package com.fcusumano.mpp.infrastructure.porting;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Identity;
import org.jooq.Record;
import org.jooq.Result;
import org.jooq.Table;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ARMOR_SET;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_CUSTOM_SET;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_CUSTOM_SET_PIECE;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ITEM;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ITEM_RARITY_BONUS;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER_ITEM;
import static org.jooq.impl.DSL.inline;

/**
 * Copia tutti i dati da un database My Pickle Pete a un PostgreSQL con lo stesso schema (creato da Liquibase):
 * censimento, utenze con le password, progressi e Custom Set. Le righe che Liquibase inserisce da solo (set,
 * utenze iniziali) si sostituiscono con quelle della sorgente; gli id restano gli stessi.
 */
public class DatabasePorting {

    private static final Logger log = LoggerFactory.getLogger(DatabasePorting.class);

    /** Tabelle nell'ordine delle chiavi esterne: si inserisce dall'alto, si svuota dal basso. */
    private static final List<Table<?>> TABLES = List.of(MPP_ARMOR_SET, MPP_USER, MPP_ITEM, MPP_ITEM_RARITY_BONUS, MPP_USER_ITEM,
                                                         MPP_CUSTOM_SET, MPP_CUSTOM_SET_PIECE);


    /** Righe copiate per tabella, nell'ordine di copia. */
    public Map<String, Integer> port(DSLContext source, DSLContext target) {
        checkTargetIsNew(target);
        final Map<String, Integer> copied = new LinkedHashMap<>();
        target.transaction(transaction -> {
            final DSLContext tx = transaction.dsl();
            TABLES.reversed().forEach(table -> tx.deleteFrom(table).execute());
            TABLES.forEach(table -> copied.put(table.getName(), copy(source, tx, table)));
            TABLES.forEach(table -> realignIdentity(tx, table));
        });
        log.info("Porting completed: {}", copied);
        return copied;
    }

    /** Si porta su un database appena creato: item o Custom Set già presenti andrebbero persi. */
    private static void checkTargetIsNew(DSLContext target) {
        if (target.fetchCount(MPP_ITEM) > 0 || target.fetchCount(MPP_CUSTOM_SET) > 0) {
            throw new IllegalStateException("Target database already contains items or custom sets: porting aborted");
        }
    }

    private static int copy(DSLContext source, DSLContext target, Table<?> table) {
        final Result<? extends Record> rows = source.selectFrom(table).fetch();
        if (rows.isEmpty()) return 0;
        target.batch(rows.stream().map(row -> target.insertInto(table).columns(table.fields()).values(row.intoList())).toList()).execute();
        return rows.size();
    }

    /** Dopo gli inserimenti con id espliciti la sequenza riparte dal massimo, altrimenti il prossimo id collide. */
    private static void realignIdentity(DSLContext target, Table<?> table) {
        final Identity<?, ?> identity = table.getIdentity();
        if (identity == null) return;
        final Field<?> id = identity.getField();
        target.fetch("SELECT setval(pg_get_serial_sequence({0}, {1}), COALESCE(MAX({2}), 0) + 1, false) FROM {3}",
                     inline(table.getName().toLowerCase()), inline(id.getName().toLowerCase()), id, table);
    }
}
