package com.fcusumano.mpp.application.rest.user.controller;

import com.fcusumano.mpp.application.rest.user.request.PasswordRequest;
import com.fcusumano.mpp.application.rest.user.request.ProfileRequest;
import com.fcusumano.mpp.application.rest.user.response.UserResponse;
import com.fcusumano.mpp.core.services.UserService;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Profilo dell'utente autenticato. */
@RestController
@RequestMapping("/api/user")
public class UserEndpoint {

    private final UserService userService;


    public UserEndpoint(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "The logged-in user, with role and personal data")
    @GetMapping
    public UserResponse get(@AuthenticationPrincipal MppUserPrincipal principal) {
        return new UserResponse(userService.single(principal.userId()));
    }

    @Operation(summary = "Update the personal data of the logged-in user")
    @PutMapping
    public UserResponse update(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody ProfileRequest request) {
        return new UserResponse(userService.updateProfile(principal.userId(), request.toModel()));
    }

    @Operation(summary = "Change the password of the logged-in user (remember-me cookies issued before stop working)")
    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(@AuthenticationPrincipal MppUserPrincipal principal, @Valid @RequestBody PasswordRequest request) {
        userService.changePassword(principal.userId(), request.currentPassword(), request.newPassword());
    }
}
