package com.fcusumano.mpp.application.rest.user.controller;

import com.fcusumano.mpp.application.rest.user.request.LoginRequest;
import com.fcusumano.mpp.application.rest.user.request.RegisterRequest;
import com.fcusumano.mpp.application.rest.user.response.UserResponse;
import com.fcusumano.mpp.core.services.UserService;
import com.fcusumano.mpp.infrastructure.security.MppUserPrincipal;
import com.fcusumano.mpp.infrastructure.security.SessionLogin;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Accesso pubblico: login e registrazione. Il logout ({@code POST /api/auth/logout}) lo gestisce il filtro di Spring Security. */
@RestController
@RequestMapping("/api/auth")
public class AuthEndpoint {

    private final UserService userService;
    private final SessionLogin sessionLogin;


    public AuthEndpoint(UserService userService, SessionLogin sessionLogin) {
        this.userService = userService;
        this.sessionLogin = sessionLogin;
    }

    @Operation(summary = "Log in with nickname and password, optionally remembering the device for 30 days")
    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        final MppUserPrincipal principal = sessionLogin.logIn(request.nickname(), request.password(), request.rememberMeOrFalse(), httpRequest, httpResponse);
        return new UserResponse(userService.single(principal.userId()));
    }

    @Operation(summary = "Register a new regular user and log in")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        userService.register(request.nickname(), request.password(), request.profileOrEmpty().toModel());
        final MppUserPrincipal principal = sessionLogin.logIn(request.nickname(), request.password(), false, httpRequest, httpResponse);
        return new UserResponse(userService.single(principal.userId()));
    }
}
