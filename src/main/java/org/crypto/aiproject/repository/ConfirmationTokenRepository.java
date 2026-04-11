package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.ConfirmationToken;
import org.crypto.aiproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {
    Optional<ConfirmationToken> findByToken(String token);
    void deleteAllByUser(User user);
}

