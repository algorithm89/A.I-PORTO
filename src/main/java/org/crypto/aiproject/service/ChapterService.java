package org.crypto.aiproject.service;

import org.crypto.aiproject.entity.Chapter;
import org.crypto.aiproject.entity.Episode;
import org.crypto.aiproject.repository.ChapterRepository;
import org.crypto.aiproject.repository.EpisodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final EpisodeRepository episodeRepository;

    public ChapterService(ChapterRepository chapterRepository, EpisodeRepository episodeRepository) {
        this.chapterRepository = chapterRepository;
        this.episodeRepository = episodeRepository;
    }

    public List<Chapter> getChaptersByEpisodeId(Long episodeId) {
        return chapterRepository.findByEpisodeIdOrderByChapterNumberAsc(episodeId);
    }

    public Optional<Chapter> getChapter(Long episodeId, Integer chapterNumber) {
        return chapterRepository.findByEpisodeIdAndChapterNumber(episodeId, chapterNumber);
    }

    @Transactional
    public Chapter createChapter(Long episodeId, Chapter chapter) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new IllegalArgumentException("Episode not found: " + episodeId));
        chapter.setEpisode(episode);
        return chapterRepository.save(chapter);
    }

    @Transactional
    public Chapter updateChapter(Long id, Chapter updated) {
        Chapter existing = chapterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found: " + id));
        existing.setChapterNumber(updated.getChapterNumber());
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        return chapterRepository.save(existing);
    }

    @Transactional
    public void deleteChapter(Long id) {
        if (!chapterRepository.existsById(id)) {
            throw new IllegalArgumentException("Chapter not found: " + id);
        }
        chapterRepository.deleteById(id);
    }
}
