package com.fcusumano.mpp.core.services;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.core.model.User;
import com.fcusumano.mpp.core.model.UserProfile;
import com.fcusumano.mpp.core.repository.UserRepository;
import com.fcusumano.mpp.infrastructure.exception.BadRequestException;
import com.fcusumano.mpp.infrastructure.exception.ObjectAlreadyExistsException;
import com.fcusumano.mpp.infrastructure.exception.ObjectNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.USER_NICKNAME_ALREADY_EXISTS;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.USER_NOT_FOUND;
import static com.fcusumano.mpp.infrastructure.exception.InternalErrorCode.WRONG_PASSWORD;
import static com.fcusumano.mpp.tools.FunctionUtils.exception;

/** Casi d'uso sulle utenze: registrazione, profilo e password. */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User single(long id) {
        return userRepository.retrieve(id).orElseThrow(exception(message -> new ObjectNotFoundException(USER_NOT_FOUND, message),
                                                                 "User '%s' not found.", id));
    }

    /** La registrazione libera crea solo utenze USER: l'unico ADMIN nasce da Liquibase. */
    @Transactional
    public User register(String nickname, String password, UserProfile profile) {
        final String normalized = nickname.strip();
        userRepository.retrieveByNickname(normalized).ifPresent(found -> {
            throw new ObjectAlreadyExistsException(USER_NICKNAME_ALREADY_EXISTS, "Nickname '%s' is already taken (user '%s').", normalized, found.id());
        });
        final long id = userRepository.insert(normalized, passwordEncoder.encode(password), UserRole.USER, profile);
        log.info("User '{}' registered with nickname '{}'", id, normalized);
        return single(id);
    }

    @Transactional
    public User updateProfile(long id, UserProfile profile) {
        single(id);
        userRepository.updateProfile(id, profile);
        log.info("Profile of user '{}' updated", id);
        return single(id);
    }

    @Transactional
    public void changePassword(long id, String currentPassword, String newPassword) {
        final User user = single(id);
        if (!passwordEncoder.matches(currentPassword, user.passwordHash())) {
            throw new BadRequestException(WRONG_PASSWORD, "Current password of user '%s' does not match.", id);
        }
        userRepository.updatePasswordHash(id, passwordEncoder.encode(newPassword));
        log.info("Password of user '{}' changed", id);
    }

    /** Password iniziali delle utenze create da Liquibase: si impostano solo se ancora assenti, poi si cambiano dal profilo. */
    @Transactional
    public void initPasswords(Map<String, String> nickname2password) {
        nickname2password.forEach((nickname, password) -> {
            if (password == null || password.isBlank()) return;
            userRepository.retrieveByNickname(nickname)
                    .filter(user -> !user.canLogIn())
                    .ifPresent(user -> {
                        userRepository.updatePasswordHash(user.id(), passwordEncoder.encode(password));
                        log.info("Initial password of user '{}' set", nickname);
                    });
        });
    }
}
