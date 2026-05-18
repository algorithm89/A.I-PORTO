package org.crypto.aiproject.controller;

import org.crypto.aiproject.entity.Tutorial;
import org.crypto.aiproject.entity.TutorialPart;
import org.crypto.aiproject.service.TutorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutorials")
public class TutorialController {

    private final TutorialService tutorialService;

    public TutorialController(TutorialService tutorialService) {
        this.tutorialService = tutorialService;
    }

    /** GET /api/tutorials — list all tutorials (public) */
    @GetMapping
    public ResponseEntity<List<Tutorial>> getAll() {
        return ResponseEntity.ok(tutorialService.getAllTutorials());
    }

    /** GET /api/tutorials/{slug} — get a tutorial by slug (public) */
    @GetMapping("/{slug}")
    public ResponseEntity<?> getBySlug(@PathVariable String slug) {
        return tutorialService.getTutorialBySlug(slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/tutorials/{id}/parts — list parts of a tutorial (public) */
    @GetMapping("/{id}/parts")
    public ResponseEntity<List<TutorialPart>> getParts(@PathVariable Long id) {
        return ResponseEntity.ok(tutorialService.getParts(id));
    }

    /** GET /api/tutorials/{id}/parts/{partNum} — get one part (public) */
    @GetMapping("/{id}/parts/{partNum}")
    public ResponseEntity<?> getPart(@PathVariable Long id, @PathVariable Integer partNum) {
        return tutorialService.getPart(id, partNum)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
