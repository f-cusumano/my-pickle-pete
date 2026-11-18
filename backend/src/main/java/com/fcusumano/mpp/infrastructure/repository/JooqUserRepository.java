package com.fcusumano.mpp.infrastructure.repository;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.core.model.User;
import com.fcusumano.mpp.core.model.UserProfile;
import com.fcusumano.mpp.core.repository.UserRepository;
import com.fcusumano.mpp.infrastructure.repository.jooq.tables.records.MppUserRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.name;
import static com.fcusumano.mpp.infrastructure.repository.EnumColumns.valueOf;
import static com.fcusumano.mpp.infrastructure.repository.jooq.Tables.MPP_USER;

/** Utenze su jOOQ. */
@Repository
public class JooqUserRepository implements UserRepository {

    private final DSLContext dsl;


    public JooqUserRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Optional<User> retrieve(long id) {
        return dsl.selectFrom(MPP_USER).where(MPP_USER.ID.eq(id)).fetchOptional(JooqUserRepository::toModel);
    }

    @Override
    public Optional<User> retrieveByNickname(String nickname) {
        return dsl.selectFrom(MPP_USER).where(MPP_USER.NICKNAME.equalIgnoreCase(nickname)).fetchOptional(JooqUserRepository::toModel);
    }

    @Override
    public long insert(String nickname, String passwordHash, UserRole role, UserProfile profile) {
        return dsl.insertInto(MPP_USER)
                .set(MPP_USER.NICKNAME, nickname)
                .set(MPP_USER.PASSWORD_HASH, passwordHash)
                .set(MPP_USER.ROLE, name(role))
                .set(MPP_USER.FIRST_NAME, profile.firstName())
                .set(MPP_USER.LAST_NAME, profile.lastName())
                .set(MPP_USER.BIRTH_DATE, profile.birthDate())
                .set(MPP_USER.EMAIL, profile.email())
                .returningResult(MPP_USER.ID)
                .fetchSingle(MPP_USER.ID);
    }

    @Override
    public void updateProfile(long id, UserProfile profile) {
        dsl.update(MPP_USER)
                .set(MPP_USER.FIRST_NAME, profile.firstName())
                .set(MPP_USER.LAST_NAME, profile.lastName())
                .set(MPP_USER.BIRTH_DATE, profile.birthDate())
                .set(MPP_USER.EMAIL, profile.email())
                .where(MPP_USER.ID.eq(id))
                .execute();
    }

    @Override
    public void updatePasswordHash(long id, String passwordHash) {
        dsl.update(MPP_USER).set(MPP_USER.PASSWORD_HASH, passwordHash).where(MPP_USER.ID.eq(id)).execute();
    }

    private static User toModel(MppUserRecord r) {
        return new User(r.getId(), r.getNickname(), r.getPasswordHash(), valueOf(UserRole.class, r.getRole()),
                        new UserProfile(r.getFirstName(), r.getLastName(), r.getBirthDate(), r.getEmail()));
    }
}
