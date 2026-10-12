package com.fcusumano.mpp.application.rest.item.request;

import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.enums.ItemType;
import com.fcusumano.mpp.core.enums.Specification;
import com.fcusumano.mpp.core.model.ItemDefinition;
import com.fcusumano.mpp.core.validation.ItemDefinitionProvider;
import com.fcusumano.mpp.core.validation.ValidItemDefinition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Objects;

import static com.fcusumano.mpp.core.Constants.MAX_ITEM_NAME_LENGTH;

/** Dati di censimento di un item (creazione e modifica). */
@ValidItemDefinition
public record ItemRequest(@NotBlank(message = "Item name must be specified.")
                          @Size(max = MAX_ITEM_NAME_LENGTH, message = "Item name allows at most 100 characters.") String name,
                          @NotNull(message = "Item type must be specified.") ItemType type,
                          Specification specification,
                          ArmorSet armorSet,
                          @Size(max = 5, message = "An item has at most 5 rarity bonuses.") List<@NotNull @Valid RarityBonusRequest> bonuses)
        implements ItemDefinitionProvider {

    @Override
    public ItemDefinition toDefinition() {
        final List<RarityBonusRequest> requestedBonuses = bonuses == null ? List.of() : bonuses;
        return new ItemDefinition(name, type, specification, armorSet,
                                  requestedBonuses.stream().filter(Objects::nonNull)
                                          .filter(b -> b.rarity() != null && b.stat() != null && b.unit() != null && b.amount() != null) //Gli incompleti li segnala @Valid
                                          .map(RarityBonusRequest::toModel)
                                          .toList());
    }
}
