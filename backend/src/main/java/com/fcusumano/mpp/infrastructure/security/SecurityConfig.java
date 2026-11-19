package com.fcusumano.mpp.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices.RememberMeTokenAlgorithm;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

import java.time.Duration;
import java.util.UUID;

/**
 * Accesso con nickname e password: sessione su cookie, "ricordami" facoltativo, CSRF per SPA (cookie XSRF-TOKEN
 * rimandato nell'header). Le API rispondono 401 senza login; il frontend e la verifica di avvio restano pubblici.
 */
@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(MppSecurityProperties.class)
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);
    private static final String REMEMBER_ME_COOKIE = "mpp-remember-me";
    private static final CsrfTokenRepository CSRF_TOKENS = CookieCsrfTokenRepository.withHttpOnlyFalse();


    /** BCrypt con prefisso {bcrypt}: un domani si cambia algoritmo senza invalidare le password salvate. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        final DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    /** Il cookie si emette solo se il login lo chiede (vedi SessionLogin); cambiando password i cookie emessi decadono. */
    @Bean
    public RememberMeServices rememberMeServices(UserDetailsService userDetailsService, MppSecurityProperties properties) {
        final TokenBasedRememberMeServices services = new TokenBasedRememberMeServices(rememberMeKey(properties), userDetailsService,
                                                                                        RememberMeTokenAlgorithm.SHA256);
        services.setAlwaysRemember(true);
        services.setCookieName(REMEMBER_ME_COOKIE);
        services.setTokenValiditySeconds((int) Duration.ofDays(properties.rememberMeDays()).toSeconds());
        return services;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, RememberMeServices rememberMeServices,
                                                   SecurityContextRepository securityContextRepository) {
        http.authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/auth/**", "/api/constants/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .csrf(csrf -> csrf.spa().csrfTokenRepository(CSRF_TOKENS))
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .rememberMe(rememberMe -> rememberMe.rememberMeServices(rememberMeServices))
                .logout(logout -> logout.logoutUrl("/api/auth/logout").logoutSuccessHandler(SecurityConfig::logoutSucceeded))
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);
        return http.build();
    }

    /** Il logout cancella il token CSRF: se ne emette subito uno nuovo, altrimenti il login successivo sarebbe rifiutato. */
    private static void logoutSucceeded(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        CSRF_TOKENS.saveToken(CSRF_TOKENS.generateToken(request), request, response);
        response.setStatus(HttpStatus.OK.value());
    }

    /** Senza chiave configurata se ne genera una a ogni avvio: i cookie "ricordami" valgono fino al riavvio. */
    private static String rememberMeKey(MppSecurityProperties properties) {
        if (properties.rememberMeKey() != null && !properties.rememberMeKey().isBlank()) return properties.rememberMeKey();
        log.warn("MPP_REMEMBER_ME_KEY not set: remember-me cookies will be invalid after a restart");
        return UUID.randomUUID().toString();
    }
}
