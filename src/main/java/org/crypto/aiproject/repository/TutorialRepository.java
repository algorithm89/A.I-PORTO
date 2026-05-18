package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.Tutorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, Long> {
    Optional<Tutorial> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
