package org.crypto.aiproject.controller;

import org.crypto.aiproject.entity.Chapter;
import org.crypto.aiproject.service.ChapterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/episodes/{episodeId}/chapters")
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    /** GET /api/episodes/{episodeId}/chapters — list chapters (public) */
    @GetMapping
    public ResponseEntity<List<Chapter>> getChapters(@PathVariable Long episodeId) {
        return ResponseEntity.ok(chapterService.getChaptersByEpisodeId(episodeId));
    }

    /** GET /api/episodes/{episodeId}/chapters/{chapterNum} — get one chapter (public) */
    @GetMapping("/{chapterNum}")
    public ResponseEntity<?> getChapter(@PathVariable Long episodeId, @PathVariable Integer chapterNum) {
        return chapterService.getChapter(episodeId, chapterNum)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
