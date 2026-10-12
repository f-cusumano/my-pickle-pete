package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.model.ArmorSetInfo;

import java.util.List;

/** Persistenza dei set di armatura (elenco fisso, si censisce solo la descrizione del bonus). */
public interface ArmorSetRepository {

    List<ArmorSetInfo> retrieveAll();

    void updateBonusDescription(ArmorSet armorSet, String bonusDescription);
}
