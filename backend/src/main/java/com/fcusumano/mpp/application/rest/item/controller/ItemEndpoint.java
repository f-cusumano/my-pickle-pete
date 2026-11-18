package com.fcusumano.mpp.application.rest.item.controller;

import com.fcusumano.mpp.application.rest.item.request.ItemRequest;
import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ItemSortOrder;
import com.fcusumano.mpp.core.enums.Rarity;
import com.fcusumano.mpp.core.services.ItemService;
import com.fcusumano.mpp.infrastructure.security.AdminOnly;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import com.fcusumano.mpp.infrastructure.security.UserOnly;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/item")
public class ItemEndpoint {

    private final ItemService itemService;


    public ItemEndpoint(ItemService itemService) {
        this.itemService = itemService;
    }

    /* --------------- CONSULTAZIONE --------------- */

    @Operation(summary = "All census items with the rarity and level reached by the user (Common 1 if never changed), in one of the preset sort orders")
    @GetMapping("/list")
    public List<ItemResponse> list(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = false) ItemSortOrder sortOrder) {
        return ItemResponse.of(itemService.list(principal.userId(), sortOrder == null ? ItemSortOrder.defaultOrder() : sortOrder));
    }

    @Operation(summary = "Single item with the rarity and level reached by the user")
    @GetMapping
    public ItemResponse get(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id) {
        return new ItemResponse(itemService.single(principal.userId(), id));
    }

    /* --------------- CENSIMENTO (ADMIN) --------------- */

    @Operation(summary = "Census a new item (admin only)")
    @AdminOnly
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody ItemRequest request) {
        return new ItemResponse(itemService.create(principal.userId(), request.toDefinition()));
    }

    @Operation(summary = "Update the census data of an item (admin only); the progress of the users is kept")
    @AdminOnly
    @PutMapping
    public ItemResponse update(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id, @Valid @RequestBody ItemRequest request) {
        return new ItemResponse(itemService.update(principal.userId(), id, request.toDefinition()));
    }

    @Operation(summary = "Delete a census item with its bonuses, removing it from the progress and custom sets of all users (admin only)")
    @AdminOnly
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id) {
        itemService.delete(principal.userId(), id);
    }

    /* --------------- INVENTARIO (USER) --------------- */

    @Operation(summary = "Set the rarity reached by the user (all lower ones are reached too), capping the level to the new maximum")
    @UserOnly
    @PutMapping("/rarity")
    public ItemResponse updateRarity(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id, @RequestParam(required = true) Rarity rarity) {
        return new ItemResponse(itemService.updateRarity(principal.userId(), id, rarity));
    }

    @Operation(summary = "Set the level reached by the user, within the maximum of the rarity")
    @UserOnly
    @PutMapping("/level")
    public ItemResponse updateLevel(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id, @RequestParam(required = true) @Min(1) int level) {
        return new ItemResponse(itemService.updateLevel(principal.userId(), id, level));
    }
}
