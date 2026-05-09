package org.crypto.aiproject.controller;

import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.entity.Chapter;
import org.crypto.aiproject.service.ChapterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/chapters")
public class AdminChapterController {

    private static final Logger log = LoggerFactory.getLogger(AdminChapterController.class);

    private final ChapterService chapterService;

    public AdminChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    /** POST /api/admin/chapters — create a chapter (ADMIN only) */
    @PostMapping
    public ResponseEntity<Chapter> createChapter(@RequestBody Chapter chapter,
                                                  @RequestParam Long episodeId) {
        log.info("ADMIN: Creating chapter {} for episode {}", chapter.getChapterNumber(), episodeId);
        return ResponseEntity.ok(chapterService.createChapter(episodeId, chapter));
    }

    /** PUT /api/admin/chapters/{id} — update a chapter (ADMIN only) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateChapter(@PathVariable Long id, @RequestBody Chapter chapter) {
        log.info("ADMIN: Updating chapter {}", id);
        try {
            return ResponseEntity.ok(chapterService.updateChapter(id, chapter));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE /api/admin/chapters/{id} — delete a chapter (ADMIN only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteChapter(@PathVariable Long id) {
        log.info("ADMIN: Deleting chapter {}", id);
        try {
            chapterService.deleteChapter(id);
            return ResponseEntity.ok(new ApiResponse(true, "Chapter deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
