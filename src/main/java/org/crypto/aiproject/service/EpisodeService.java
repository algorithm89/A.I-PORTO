package org.crypto.aiproject.service;

import org.crypto.aiproject.entity.Episode;
import org.crypto.aiproject.repository.EpisodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EpisodeService {

    private final EpisodeRepository episodeRepository;

    public EpisodeService(EpisodeRepository episodeRepository) {
        this.episodeRepository = episodeRepository;
    }

    public List<Episode> getAllEpisodes() {
        return episodeRepository.findAll();
    }

    public List<Episode> getEpisodesBySeries(String series) {
        return episodeRepository.findBySeriesOrderByEpisodeNumberAsc(series);
    }

    public Optional<Episode> getEpisodeById(Long id) {
        return episodeRepository.findById(id);
    }

    public Optional<Episode> getEpisodeBySeriesAndNumber(String series, Integer episodeNumber) {
        return episodeRepository.findBySeriesAndEpisodeNumber(series, episodeNumber);
    }

    @Transactional
    public Episode createEpisode(Episode episode) {
        episode.setCreatedAt(LocalDateTime.now());
        episode.setUpdatedAt(LocalDateTime.now());
        return episodeRepository.save(episode);
    }

    @Transactional
    public Episode updateEpisode(Long id, Episode updated) {
        Episode existing = episodeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Episode not found: " + id));
        existing.setSeries(updated.getSeries());
        existing.setEpisodeNumber(updated.getEpisodeNumber());
        existing.setTitle(updated.getTitle());
        existing.setSubtitle(updated.getSubtitle());
        existing.setCoverImage(updated.getCoverImage());
        existing.setContent(updated.getContent());
        existing.setUpdatedAt(LocalDateTime.now());
        return episodeRepository.save(existing);
    }

    @Transactional
    public void deleteEpisode(Long id) {
        if (!episodeRepository.existsById(id)) {
            throw new IllegalArgumentException("Episode not found: " + id);
        }
        episodeRepository.deleteById(id);
    }
}
