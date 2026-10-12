package com.fcusumano.mpp.application.rest.item.controller;

import com.fcusumano.mpp.application.rest.item.request.ItemRequest;
import com.fcusumano.mpp.application.rest.item.response.ItemResponse;
import com.fcusumano.mpp.core.enums.ItemSortOrder;
import com.fcusumano.mpp.core.services.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
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

    @Operation(summary = "All census items, in one of the preset sort orders")
    @GetMapping("/list")
    public List<ItemResponse> list(@RequestParam(required = false) ItemSortOrder sortOrder) {
        return ItemResponse.of(itemService.list(sortOrder == null ? ItemSortOrder.defaultOrder() : sortOrder));
    }

    @Operation(summary = "Single item with its current rarity and level")
    @GetMapping
    public ItemResponse get(@RequestParam(required = true) long id) {
        return new ItemResponse(itemService.single(id));
    }

    /* --------------- CENSIMENTO --------------- */

    @Operation(summary = "Census a new item, starting from Common 1/10")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@Valid @RequestBody ItemRequest request) {
        return new ItemResponse(itemService.create(request.toDefinition()));
    }

    @Operation(summary = "Update the census data of an item, keeping its current rarity and level")
    @PutMapping
    public ItemResponse update(@RequestParam(required = true) long id, @Valid @RequestBody ItemRequest request) {
        return new ItemResponse(itemService.update(id, request.toDefinition()));
    }

    @Operation(summary = "Delete a census item with its bonuses")
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam(required = true) long id) {
        itemService.delete(id);
    }

    /* --------------- INVENTARIO --------------- */

    @Operation(summary = "Promote the item to the next rarity, keeping its level")
    @PostMapping("/promote-rarity")
    public ItemResponse promoteRarity(@RequestParam(required = true) long id) {
        return new ItemResponse(itemService.promoteRarity(id));
    }

    @Operation(summary = "Bring the item back to Common, capping its level to 10")
    @PostMapping("/reset-rarity")
    public ItemResponse resetRarity(@RequestParam(required = true) long id) {
        return new ItemResponse(itemService.resetRarity(id));
    }

    @Operation(summary = "Set the current level of the item, within the maximum of its rarity")
    @PutMapping("/level")
    public ItemResponse updateLevel(@RequestParam(required = true) long id, @RequestParam(required = true) @Min(1) int level) {
        return new ItemResponse(itemService.updateLevel(id, level));
    }
}
