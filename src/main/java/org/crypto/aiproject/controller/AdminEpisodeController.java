package org.crypto.aiproject.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.dto.FormatRequest;
import org.crypto.aiproject.entity.Episode;
import org.crypto.aiproject.service.EpisodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/episodes")
public class AdminEpisodeController {

    private static final Logger log = LoggerFactory.getLogger(AdminEpisodeController.class);

    private final EpisodeService episodeService;
    private final WebClient webClient;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminEpisodeController(EpisodeService episodeService,
                                  @Value("${openai.api-key:}") String apiKey,
                                  @Value("${openai.model:gpt-4o-mini}") String model) {
        this.episodeService = episodeService;
        this.model = model;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    /** POST /api/admin/episodes — create episode (ADMIN only) */
    @PostMapping
    public ResponseEntity<Episode> createEpisode(@RequestBody Episode episode) {
        log.info("ADMIN: Creating episode {} Ep {}", episode.getSeries(), episode.getEpisodeNumber());
        return ResponseEntity.ok(episodeService.createEpisode(episode));
    }

    /** PUT /api/admin/episodes/{id} — update episode (ADMIN only) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEpisode(@PathVariable Long id, @RequestBody Episode episode) {
        log.info("ADMIN: Updating episode {}", id);
        try {
            return ResponseEntity.ok(episodeService.updateEpisode(id, episode));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** DELETE /api/admin/episodes/{id} — delete episode (ADMIN only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEpisode(@PathVariable Long id) {
        log.info("ADMIN: Deleting episode {}", id);
        try {
            episodeService.deleteEpisode(id);
            return ResponseEntity.ok(new ApiResponse(true, "Episode deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/admin/episodes/format
     * Streams structured HTML built by OpenAI from raw story text:
     *   &lt;p class="ns-prose"&gt; for paragraphs
     *   &lt;hr class="ns-divider"/&gt; for scene breaks (___)
     *   &lt;pre class="ns-system-text"&gt; for cybernetic/system readouts
     *   &lt;h2&gt; for chapter titles
     *
     * The response is streamed (Server-Sent Events) so a long story keeps the
     * proxy connection alive — a buffered request would otherwise exceed the
     * nginx proxy_read_timeout and return a 504. Each event's data is a
     * JSON-encoded HTML fragment, so newlines inside &lt;pre&gt; blocks survive
     * the SSE line-framing.
     */
    @PostMapping(value = "/format", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> formatWithAI(@RequestBody FormatRequest request) {
        log.info("ADMIN: AI formatting requested | text length={}", request.getRawText().length());

        String systemPrompt = """
                You are a story formatter for a cyberpunk/sci-fi website. Convert the raw story text into clean HTML.

                Rules:
                - Wrap every paragraph in <p class="ns-prose">...</p>
                - Scene breaks (lines of underscores like _________) become <hr class="ns-divider"/>
                - Cybernetic system readouts (ALL CAPS lines like "TEMPORAL DISPLACEMENT: COMPLETE", scan percentages, status messages) should be wrapped in <pre class="ns-system-text">...</pre>
                - Chapter titles like "Chapter 1" or "Chapter 2" should be <h2>Chapter 1</h2>
                - Dialogue should stay inline in paragraphs — don't break dialogue onto separate lines unless it's a new speaker
                - Preserve ALL original text exactly. Don't summarize, don't change words, don't add content
                - Don't wrap the output in ```html or any markdown fences — just return the raw HTML
                - Don't add <html>, <body>, or <head> tags

                Return ONLY the formatted HTML, nothing else.""";

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", request.getRawText())
        );

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.2,
                "stream", true
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(chunk -> {
                    String trimmed = chunk.trim();
                    if (trimmed.equals("[DONE]") || trimmed.equals("data: [DONE]")) return null;
                    String data = chunk.startsWith("data: ") ? chunk.substring(6).trim() : trimmed;
                    if (data.isEmpty()) return null;
                    try {
                        JsonNode node = objectMapper.readTree(data);
                        JsonNode content = node.path("choices").path(0).path("delta").path("content");
                        if (!content.isMissingNode() && !content.isNull()) {
                            // JSON-encode the fragment so it survives SSE line-framing.
                            return objectMapper.writeValueAsString(content.asText());
                        }
                    } catch (Exception e) {
                        log.debug("Skipping non-JSON chunk: {}", chunk);
                    }
                    return null;
                })
                .doOnComplete(() -> log.info("ADMIN: AI formatting stream complete"))
                .onErrorResume(e -> {
                    log.error("ADMIN: AI formatting failed", e);
                    try {
                        return Flux.just(objectMapper.writeValueAsString(
                                "<!--FORMAT_ERROR:" + e.getMessage() + "-->"));
                    } catch (Exception ex) {
                        return Flux.just("\"<!--FORMAT_ERROR-->\"");
                    }
                });
    }
}
