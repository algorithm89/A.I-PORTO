package org.crypto.aiproject.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.crypto.aiproject.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;
    private final String model;
    private final String systemPrompt;
    private final String guestSystemPrompt;

    public ChatService(
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-4o-mini}") String model,
            @Value("${openai.system-prompt:You are a helpful AI assistant for BublikStudios that knows about animation and story telling.}") String systemPrompt
    ) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
        this.model = model;
        this.systemPrompt = systemPrompt;
        this.guestSystemPrompt = systemPrompt
                + " The user is a guest visitor (not logged in). Welcome them warmly to BublikStudios! "
                + "Gently encourage them to create a free account to get the full experience. "
                + "You can still help them, but remind them that members get more features.";
        log.info("ChatService initialized | provider=OpenAI model={}", model);
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("ChatService: openai.api-key is NOT set — chat will fail until key is added to Vault!");
        }
    }

    /**
     * Stream a chat response from OpenAI.
     * Returns a Flux of text chunks (token by token).
     */
    public Flux<String> streamChat(String username, boolean loggedIn, ChatRequest request) {
        log.info("CHAT request | user={} loggedIn={} message={}", username, loggedIn,
                request.getMessage().substring(0, Math.min(80, request.getMessage().length())));

        String prompt = loggedIn ? systemPrompt : guestSystemPrompt;

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", prompt));

        if (request.getHistory() != null) {
            for (ChatRequest.ChatMessage msg : request.getHistory()) {
                messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
            }
        }
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "stream", true
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(chunk -> {
                    // OpenAI sends "data: [DONE]" at end
                    if ("[DONE]".equals(chunk.trim()) || chunk.trim().equals("data: [DONE]")) {
                        return null;
                    }
                    // Strip "data: " prefix
                    String data = chunk.startsWith("data: ") ? chunk.substring(6).trim() : chunk.trim();
                    if (data.isEmpty()) return null;
                    try {
                        JsonNode node = objectMapper.readTree(data);
                        JsonNode content = node.path("choices").path(0).path("delta").path("content");
                        if (!content.isMissingNode() && !content.isNull()) {
                            return content.asText();
                        }
                    } catch (Exception e) {
                        log.debug("Skipping non-JSON chunk: {}", chunk);
                    }
                    return null;
                })
                .doOnComplete(() -> log.info("CHAT complete | user={} loggedIn={}", username, loggedIn))
                .doOnError(e -> log.error("CHAT error | user={} error={}", username, e.getMessage()));
    }
}
