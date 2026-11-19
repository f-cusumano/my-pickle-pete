package com.fcusumano.mpp.application.rest.customset.controller;

import com.fcusumano.mpp.application.rest.customset.request.BestSetRequest;
import com.fcusumano.mpp.application.rest.customset.request.CustomSetPiecesRequest;
import com.fcusumano.mpp.application.rest.customset.request.CustomSetRequest;
import com.fcusumano.mpp.application.rest.customset.response.CustomSetResponse;
import com.fcusumano.mpp.core.enums.ItemConfiguration;
import com.fcusumano.mpp.core.services.CustomSetService;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import com.fcusumano.mpp.infrastructure.security.UserOnly;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
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

/** Set custom dell'utente autenticato: l'ADMIN non ne ha. */
@UserOnly
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
    public List<CustomSetResponse> list(@AuthenticationPrincipal MppUserPrincipal principal) {
        return CustomSetResponse.of(customSetService.list(principal.userId()));
    }

    @Operation(summary = "Single custom set with current and top stats")
    @GetMapping
    public CustomSetResponse get(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id) {
        return new CustomSetResponse(customSetService.single(principal.userId(), id));
    }

    /* --------------- SALVATAGGIO --------------- */

    @Operation(summary = "Save a new custom set (at most one armor piece per slot, optional weapon and ability)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomSetResponse create(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody CustomSetRequest request) {
        return new CustomSetResponse(customSetService.create(principal.userId(), request.toDefinition()));
    }

    @Operation(summary = "Overwrite name, pieces, weapon and ability of a custom set")
    @PutMapping
    public CustomSetResponse update(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id, @Valid @RequestBody CustomSetRequest request) {
        return new CustomSetResponse(customSetService.update(principal.userId(), id, request.toDefinition()));
    }

    @Operation(summary = "Delete a custom set (its items stay in the inventory)")
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal MppUserPrincipal principal, @RequestParam(required = true) long id) {
        customSetService.delete(principal.userId(), id);
    }

    /* --------------- CALCOLI --------------- */

    @Operation(summary = "Stats of an unsaved set (pieces, optional weapon and ability), as they would be once saved")
    @PostMapping("/evaluate")
    public CustomSetResponse evaluate(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody CustomSetPiecesRequest request) {
        return new CustomSetResponse(customSetService.evaluate(principal.userId(), request.itemIdsOrEmpty(), request.weaponId(), request.abilityId()));
    }

    @Operation(summary = "Up to 3 sets maximizing the primary stat (then the secondary) at the current rarity and level of the items")
    @PostMapping("/calculate-best-now")
    public List<CustomSetResponse> calculateBestNow(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody BestSetRequest request) {
        return best(principal, ItemConfiguration.CURRENT, request);
    }

    @Operation(summary = "Up to 3 sets maximizing the primary stat (then the secondary) at the maximum rarity and level of the items")
    @PostMapping("/calculate-best-potential")
    public List<CustomSetResponse> calculateBestPotential(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody BestSetRequest request) {
        return best(principal, ItemConfiguration.TOP, request);
    }

    private List<CustomSetResponse> best(MppUserPrincipal principal, ItemConfiguration configuration, BestSetRequest request) {
        return CustomSetResponse.of(customSetService.best(principal.userId(), configuration, request.primary().toModel(),
                                                          request.secondary() == null ? null : request.secondary().toModel()));
    }
}
