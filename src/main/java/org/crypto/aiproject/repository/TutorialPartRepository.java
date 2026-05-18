package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.TutorialPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorialPartRepository extends JpaRepository<TutorialPart, Long> {
    List<TutorialPart> findByTutorialIdOrderByPartNumberAsc(Long tutorialId);
    Optional<TutorialPart> findByTutorialIdAndPartNumber(Long tutorialId, Integer partNumber);
    void deleteAllByTutorialId(Long tutorialId);
}
