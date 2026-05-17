package org.crypto.aiproject.dto;

import java.time.LocalDateTime;

/** Public-safe episode metadata for the cartoon blog listing — no story content. */
public record EpisodeSummary(
        Long id,
        String series,
        Integer episodeNumber,
        String title,
        String subtitle,
        String coverImage,
        LocalDateTime createdAt
) {}
