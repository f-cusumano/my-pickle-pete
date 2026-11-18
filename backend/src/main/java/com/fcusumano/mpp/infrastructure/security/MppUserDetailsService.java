package com.fcusumano.mpp.infrastructure.security;

import com.fcusumano.mpp.core.model.User;
import com.fcusumano.mpp.core.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Utenze per il login e per il cookie "ricordami": senza password impostata non si entra. */
@Service
public class MppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;


    public MppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String nickname) {
        return userRepository.retrieveByNickname(nickname)
                .filter(User::canLogIn)
                .map(MppUserPrincipal::of)
                .orElseThrow(() -> new UsernameNotFoundException("User '%s' not found or without password.".formatted(nickname)));
    }
}
