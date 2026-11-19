package com.fcusumano.mpp.infrastructure.security;

import com.fcusumano.mpp.core.services.UserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** All'avvio imposta le password delle utenze create da Liquibase che non ne hanno ancora una (MPP_ADMIN_PASSWORD, MPP_OWNER_PASSWORD). */
@Component
public class InitialPasswordsRunner implements ApplicationRunner {

    private final UserService userService;
    private final MppSecurityProperties properties;


    public InitialPasswordsRunner(UserService userService, MppSecurityProperties properties) {
        this.userService = userService;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        userService.initPasswords(properties.initialPasswords());
    }
}
