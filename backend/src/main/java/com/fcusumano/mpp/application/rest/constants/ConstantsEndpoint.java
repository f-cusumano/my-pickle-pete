package com.fcusumano.mpp.application.rest.constants;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/constants")
public class ConstantsEndpoint {

    private static final GameConstantsResponse GAME_CONSTANTS = GameConstantsResponse.build(); //Immutabili: calcolate una volta


    @Operation(summary = "Fixed game values (rarities, types, specifications, sets, stats, sort orders) in display order")
    @GetMapping("/game")
    public GameConstantsResponse game() {
        return GAME_CONSTANTS;
    }
}
