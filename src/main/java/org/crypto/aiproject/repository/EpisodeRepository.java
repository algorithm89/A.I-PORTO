package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {
    List<Episode> findBySeriesOrderByEpisodeNumberAsc(String series);
    Optional<Episode> findBySeriesAndEpisodeNumber(String series, Integer episodeNumber);
}
