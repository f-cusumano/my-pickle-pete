package com.fcusumano.mpp.application.rest.armorset.controller;

import com.fcusumano.mpp.application.rest.armorset.request.ArmorSetRequest;
import com.fcusumano.mpp.application.rest.armorset.response.ArmorSetResponse;
import com.fcusumano.mpp.application.rest.armorset.response.FullSetResponse;
import com.fcusumano.mpp.core.enums.ArmorSet;
import com.fcusumano.mpp.core.services.ArmorSetService;
import com.fcusumano.mpp.infrastructure.security.AdminOnly;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/armor-set")
public class ArmorSetEndpoint {

    private final ArmorSetService armorSetService;


    public ArmorSetEndpoint(ArmorSetService armorSetService) {
        this.armorSetService = armorSetService;
    }

    @Operation(summary = "All armor sets in game order, with their 4-piece bonus description")
    @GetMapping("/list")
    public List<ArmorSetResponse> list() {
        return armorSetService.list().stream().map(ArmorSetResponse::new).toList();
    }

    @Operation(summary = "Update the 4-piece bonus description of an armor set (admin only)")
    @AdminOnly
    @PutMapping
    public ArmorSetResponse update(@RequestParam(required = true) ArmorSet armorSet, @Valid @RequestBody ArmorSetRequest request) {
        return new ArmorSetResponse(armorSetService.updateBonusDescription(armorSet, request.bonusDescription()));
    }

    @Operation(summary = "Full sets: census pieces of every armor set with current (progress of the user) and top stats")
    @GetMapping("/full-set/list")
    public List<FullSetResponse> fullSets(@AuthenticationPrincipal MppUserPrincipal principal) {
        return armorSetService.fullSets(principal.userId()).stream().map(FullSetResponse::new).toList();
    }
}
