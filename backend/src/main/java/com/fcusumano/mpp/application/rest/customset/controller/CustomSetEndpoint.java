package com.fcusumano.mpp.application.rest.customset.controller;

import com.fcusumano.mpp.application.rest.customset.request.BestSetRequest;
import com.fcusumano.mpp.application.rest.customset.request.CustomSetPiecesRequest;
import com.fcusumano.mpp.application.rest.customset.request.CustomSetRequest;
import com.fcusumano.mpp.application.rest.customset.response.CustomSetResponse;
import com.fcusumano.mpp.core.enums.ItemConfiguration;
import com.fcusumano.mpp.core.services.CustomSetService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
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
@RequestMapping("/api/custom-set")
public class CustomSetEndpoint {

    private final CustomSetService customSetService;


    public CustomSetEndpoint(CustomSetService customSetService) {
        this.customSetService = customSetService;
    }

    /* --------------- CONSULTAZIONE --------------- */

    @Operation(summary = "All custom sets by name, with current and top stats")
    @GetMapping("/list")
    public List<CustomSetResponse> list() {
        return CustomSetResponse.of(customSetService.list());
    }

    @Operation(summary = "Single custom set with current and top stats")
    @GetMapping
    public CustomSetResponse get(@RequestParam(required = true) long id) {
        return new CustomSetResponse(customSetService.single(id));
    }

    /* --------------- SALVATAGGIO --------------- */

    @Operation(summary = "Save a new custom set (at most one armor piece per slot, optional weapon)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomSetResponse create(@Valid @RequestBody CustomSetRequest request) {
        return new CustomSetResponse(customSetService.create(request.toDefinition()));
    }

    @Operation(summary = "Overwrite name, pieces and weapon of a custom set")
    @PutMapping
    public CustomSetResponse update(@RequestParam(required = true) long id, @Valid @RequestBody CustomSetRequest request) {
        return new CustomSetResponse(customSetService.update(id, request.toDefinition()));
    }

    @Operation(summary = "Delete a custom set (its items stay in the inventory)")
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam(required = true) long id) {
        customSetService.delete(id);
    }

    /* --------------- CALCOLI --------------- */

    @Operation(summary = "Stats of an unsaved set (pieces and optional weapon), as they would be once saved")
    @PostMapping("/evaluate")
    public CustomSetResponse evaluate(@Valid @RequestBody CustomSetPiecesRequest request) {
        return new CustomSetResponse(customSetService.evaluate(request.itemIdsOrEmpty(), request.weaponId()));
    }

    @Operation(summary = "Up to 3 sets maximizing the primary stat (then the secondary) at the current rarity and level of the items")
    @PostMapping("/calculate-best-now")
    public List<CustomSetResponse> calculateBestNow(@Valid @RequestBody BestSetRequest request) {
        return best(ItemConfiguration.CURRENT, request);
    }

    @Operation(summary = "Up to 3 sets maximizing the primary stat (then the secondary) at the maximum rarity and level of the items")
    @PostMapping("/calculate-best-potential")
    public List<CustomSetResponse> calculateBestPotential(@Valid @RequestBody BestSetRequest request) {
        return best(ItemConfiguration.TOP, request);
    }

    private List<CustomSetResponse> best(ItemConfiguration configuration, BestSetRequest request) {
        return CustomSetResponse.of(customSetService.best(configuration, request.primary().toModel(),
                                                          request.secondary() == null ? null : request.secondary().toModel()));
    }
}
