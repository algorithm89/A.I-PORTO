package org.crypto.aiproject.controller;

import org.crypto.aiproject.entity.Episode;
import org.crypto.aiproject.service.EpisodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/episodes")
public class EpisodeController {

    private final EpisodeService episodeService;

    public EpisodeController(EpisodeService episodeService) {
        this.episodeService = episodeService;
    }

    /** GET /api/episodes — list all episodes (public) */
    @GetMapping
    public ResponseEntity<List<Episode>> getAllEpisodes() {
        return ResponseEntity.ok(episodeService.getAllEpisodes());
    }

    /** GET /api/episodes/{id} — get single episode by ID (public) */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEpisodeById(@PathVariable Long id) {
        return episodeService.getEpisodeById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/episodes/series/{series} — get all episodes of a series (public) */
    @GetMapping("/series/{series}")
    public ResponseEntity<List<Episode>> getEpisodesBySeries(@PathVariable String series) {
        return ResponseEntity.ok(episodeService.getEpisodesBySeries(series));
    }

    /** GET /api/episodes/series/{series}/ep/{epNum} — get specific episode by series + number (public) */
    @GetMapping("/series/{series}/ep/{epNum}")
    public ResponseEntity<?> getEpisodeBySeriesAndNumber(
            @PathVariable String series, @PathVariable Integer epNum) {
        return episodeService.getEpisodeBySeriesAndNumber(series, epNum)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
