package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByEpisodeIdOrderByChapterNumberAsc(Long episodeId);
    Optional<Chapter> findByEpisodeIdAndChapterNumber(Long episodeId, Integer chapterNumber);
    void deleteAllByEpisodeId(Long episodeId);
}
