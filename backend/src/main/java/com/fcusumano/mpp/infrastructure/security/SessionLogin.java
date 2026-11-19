package com.fcusumano.mpp.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

/** Login da API JSON: verifica le credenziali, salva l'autenticazione in sessione ed emette il cookie "ricordami" se richiesto. */
@Component
public class SessionLogin {

    private static final Logger log = LoggerFactory.getLogger(SessionLogin.class);

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final RememberMeServices rememberMeServices;
    private final SecurityContextHolderStrategy contextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();


    public SessionLogin(AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository,
                        RememberMeServices rememberMeServices) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.rememberMeServices = rememberMeServices;
    }

    /** Credenziali errate: AuthenticationException, tradotta in 401 dal gestore delle eccezioni. */
    public MppUserPrincipal logIn(String nickname, String password, boolean rememberMe, HttpServletRequest request, HttpServletResponse response) {
        final Authentication authentication = authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(nickname, password));
        final HttpSession previousSession = request.getSession(false);
        if (previousSession != null) request.changeSessionId(); //Contro la session fixation
        final SecurityContext context = contextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        contextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        if (rememberMe) rememberMeServices.loginSuccess(request, response, authentication);
        final MppUserPrincipal principal = (MppUserPrincipal) authentication.getPrincipal();
        log.info("User '{}' logged in (remember me: {})", principal.userId(), rememberMe);
        return principal;
    }
}
