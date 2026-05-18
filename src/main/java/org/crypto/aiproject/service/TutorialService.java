package org.crypto.aiproject.service;

import org.crypto.aiproject.entity.Tutorial;
import org.crypto.aiproject.entity.TutorialPart;
import org.crypto.aiproject.repository.TutorialPartRepository;
import org.crypto.aiproject.repository.TutorialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TutorialService {

    private final TutorialRepository tutorialRepository;
    private final TutorialPartRepository partRepository;

    public TutorialService(TutorialRepository tutorialRepository, TutorialPartRepository partRepository) {
        this.tutorialRepository = tutorialRepository;
        this.partRepository = partRepository;
    }

    // ── Tutorials ──

    public List<Tutorial> getAllTutorials() {
        return tutorialRepository.findAll();
    }

    public Optional<Tutorial> getTutorialBySlug(String slug) {
        return tutorialRepository.findBySlug(slug);
    }

    @Transactional
    public Tutorial createTutorial(Tutorial tutorial) {
        tutorial.setCreatedAt(LocalDateTime.now());
        tutorial.setUpdatedAt(LocalDateTime.now());
        return tutorialRepository.save(tutorial);
    }

    @Transactional
    public Tutorial updateTutorial(Long id, Tutorial updated) {
        Tutorial existing = tutorialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tutorial not found: " + id));
        existing.setSlug(updated.getSlug());
        existing.setTitle(updated.getTitle());
        existing.setTrack(updated.getTrack());
        existing.setLevel(updated.getLevel());
        existing.setExcerpt(updated.getExcerpt());
        existing.setCoverImage(updated.getCoverImage());
        existing.setUpdatedAt(LocalDateTime.now());
        return tutorialRepository.save(existing);
    }

    @Transactional
    public void deleteTutorial(Long id) {
        if (!tutorialRepository.existsById(id)) {
            throw new IllegalArgumentException("Tutorial not found: " + id);
        }
        partRepository.deleteAllByTutorialId(id);
        tutorialRepository.deleteById(id);
    }

    // ── Parts ──

    public List<TutorialPart> getParts(Long tutorialId) {
        return partRepository.findByTutorialIdOrderByPartNumberAsc(tutorialId);
    }

    public Optional<TutorialPart> getPart(Long tutorialId, Integer partNumber) {
        return partRepository.findByTutorialIdAndPartNumber(tutorialId, partNumber);
    }

    @Transactional
    public TutorialPart createPart(Long tutorialId, TutorialPart part) {
        Tutorial tutorial = tutorialRepository.findById(tutorialId)
                .orElseThrow(() -> new IllegalArgumentException("Tutorial not found: " + tutorialId));
        part.setTutorial(tutorial);
        return partRepository.save(part);
    }

    @Transactional
    public TutorialPart updatePart(Long id, TutorialPart updated) {
        TutorialPart existing = partRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + id));
        existing.setPartNumber(updated.getPartNumber());
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        return partRepository.save(existing);
    }

    @Transactional
    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new IllegalArgumentException("Part not found: " + id);
        }
        partRepository.deleteById(id);
    }
}
