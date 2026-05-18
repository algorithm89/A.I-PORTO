package org.crypto.aiproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "tutorial_parts")
public class TutorialPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorial_id", nullable = false)
    @JsonIgnore
    private Tutorial tutorial;

    @Column(name = "tutorial_id", insertable = false, updatable = false)
    private Long tutorialId;

    @Column(nullable = false)
    private Integer partNumber;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    public TutorialPart() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tutorial getTutorial() { return tutorial; }
    public void setTutorial(Tutorial tutorial) { this.tutorial = tutorial; }

    public Long getTutorialId() { return tutorialId; }
    public void setTutorialId(Long tutorialId) { this.tutorialId = tutorialId; }

    public Integer getPartNumber() { return partNumber; }
    public void setPartNumber(Integer partNumber) { this.partNumber = partNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
