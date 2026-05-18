package org.crypto.aiproject.controller;

import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.entity.Tutorial;
import org.crypto.aiproject.entity.TutorialPart;
import org.crypto.aiproject.service.TutorialService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tutorials")
public class AdminTutorialController {

    private static final Logger log = LoggerFactory.getLogger(AdminTutorialController.class);

    private final TutorialService tutorialService;

    public AdminTutorialController(TutorialService tutorialService) {
        this.tutorialService = tutorialService;
    }

    /** POST /api/admin/tutorials — create a tutorial (ADMIN only) */
    @PostMapping
    public ResponseEntity<Tutorial> createTutorial(@RequestBody Tutorial tutorial) {
        log.info("ADMIN: Creating tutorial {}", tutorial.getSlug());
        return ResponseEntity.ok(tutorialService.createTutorial(tutorial));
    }

    /** PUT /api/admin/tutorials/{id} — update a tutorial (ADMIN only) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTutorial(@PathVariable Long id, @RequestBody Tutorial tutorial) {
        log.info("ADMIN: Updating tutorial {}", id);
        try {
            return ResponseEntity.ok(tutorialService.updateTutorial(id, tutorial));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE /api/admin/tutorials/{id} — delete a tutorial (ADMIN only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTutorial(@PathVariable Long id) {
        log.info("ADMIN: Deleting tutorial {}", id);
        try {
            tutorialService.deleteTutorial(id);
            return ResponseEntity.ok(new ApiResponse(true, "Tutorial deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** POST /api/admin/tutorials/{id}/parts — create a part (ADMIN only) */
    @PostMapping("/{id}/parts")
    public ResponseEntity<TutorialPart> createPart(@PathVariable Long id, @RequestBody TutorialPart part) {
        log.info("ADMIN: Creating part {} for tutorial {}", part.getPartNumber(), id);
        return ResponseEntity.ok(tutorialService.createPart(id, part));
    }

    /** PUT /api/admin/tutorials/parts/{partId} — update a part (ADMIN only) */
    @PutMapping("/parts/{partId}")
    public ResponseEntity<?> updatePart(@PathVariable Long partId, @RequestBody TutorialPart part) {
        log.info("ADMIN: Updating tutorial part {}", partId);
        try {
            return ResponseEntity.ok(tutorialService.updatePart(partId, part));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE /api/admin/tutorials/parts/{partId} — delete a part (ADMIN only) */
    @DeleteMapping("/parts/{partId}")
    public ResponseEntity<ApiResponse> deletePart(@PathVariable Long partId) {
        log.info("ADMIN: Deleting tutorial part {}", partId);
        try {
            tutorialService.deletePart(partId);
            return ResponseEntity.ok(new ApiResponse(true, "Part deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
