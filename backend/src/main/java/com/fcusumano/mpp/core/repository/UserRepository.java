package com.fcusumano.mpp.core.repository;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.core.model.User;
import com.fcusumano.mpp.core.model.UserProfile;

import java.util.Optional;

/** Persistenza delle utenze. */
public interface UserRepository {

    Optional<User> retrieve(long id);

    /** Ricerca senza distinzione di maiuscole. */
    Optional<User> retrieveByNickname(String nickname);

    long insert(String nickname, String passwordHash, UserRole role, UserProfile profile);

    void updateProfile(long id, UserProfile profile);

    void updatePasswordHash(long id, String passwordHash);
}
