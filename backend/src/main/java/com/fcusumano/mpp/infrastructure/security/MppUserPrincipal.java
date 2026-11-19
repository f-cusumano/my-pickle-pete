package com.fcusumano.mpp.infrastructure.security;

import com.fcusumano.mpp.core.enums.UserRole;
import com.fcusumano.mpp.core.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/** Utente autenticato: i controller ne leggono l'id per lavorare sui suoi progressi e sui suoi set. */
public record MppUserPrincipal(long userId, String nickname, String passwordHash, UserRole role) implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;


    public static MppUserPrincipal of(User user) {
        return new MppUserPrincipal(user.id(), user.nickname(), user.passwordHash(), user.role());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.authority()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return nickname;
    }
}
