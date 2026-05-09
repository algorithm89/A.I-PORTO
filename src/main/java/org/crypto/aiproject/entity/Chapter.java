package org.crypto.aiproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "chapters")
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id", nullable = false)
    @JsonIgnore
    private Episode episode;

    @Column(name = "episode_id", insertable = false, updatable = false)
    private Long episodeId;

    @Column(nullable = false)
    private Integer chapterNumber;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    public Chapter() {}

    public Chapter(Episode episode, Integer chapterNumber, String title, String content) {
        this.episode = episode;
        this.chapterNumber = chapterNumber;
        this.title = title;
        this.content = content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Episode getEpisode() { return episode; }
    public void setEpisode(Episode episode) { this.episode = episode; }

    public Long getEpisodeId() { return episodeId; }
    public void setEpisodeId(Long episodeId) { this.episodeId = episodeId; }

    public Integer getChapterNumber() { return chapterNumber; }
    public void setChapterNumber(Integer chapterNumber) { this.chapterNumber = chapterNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
