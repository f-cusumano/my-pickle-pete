package com.fcusumano.mpp.infrastructure.repository;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.ArmorSetInfo;
import com.fcusumano.mpp.core.repository.ArmorSetRepository;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.name;
import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.valueOf;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_ARMOR_SET;

/** Set di armatura su jOOQ: le righe esistono già (seed Liquibase), si aggiorna solo la descrizione del bonus. */
@Repository
public class JooqArmorSetRepository implements ArmorSetRepository {

    private final DSLContext dsl;


    public JooqArmorSetRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public List<ArmorSetInfo> retrieveAll() {
        return dsl.selectFrom(MPP_ARMOR_SET).fetch(r -> new ArmorSetInfo(valueOf(ArmorSet.class, r.getCode()), r.getBonusDescription()));
    }

    @Override
    public void updateBonusDescription(ArmorSet armorSet, String bonusDescription) {
        dsl.update(MPP_ARMOR_SET).set(MPP_ARMOR_SET.BONUS_DESCRIPTION, bonusDescription).where(MPP_ARMOR_SET.CODE.eq(name(armorSet))).execute();
    }
}
