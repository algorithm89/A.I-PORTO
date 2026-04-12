package org.crypto.aiproject.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.crypto.aiproject.dto.ChatRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    public ChatService(
            @Value("${ollama.base-url:http://127.0.0.1:11434}") String ollamaBaseUrl,
            @Value("${ollama.model:llama3.2:3b}") String model,
            @Value("${ollama.system-prompt:You are a helpful AI assistant for BublikStudios. Be concise, friendly, and helpful.}") String systemPrompt
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(ollamaBaseUrl)
                .build();
        this.model = model;
        this.systemPrompt = systemPrompt;
        log.info("ChatService initialized | ollama={} model={}", ollamaBaseUrl, model);
    }

    /**
     * Stream a chat response from Ollama.
     * Returns a Flux of text chunks (token by token).
     */
    public Flux<String> streamChat(String username, ChatRequest request) {
        log.info("CHAT request | user={} message={}", username,
                request.getMessage().substring(0, Math.min(80, request.getMessage().length())));

        // Build message list: system + history + current message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

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
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(chunk -> {
                    try {
                        JsonNode node = objectMapper.readTree(chunk);
                        JsonNode messageNode = node.path("message").path("content");
                        if (!messageNode.isMissingNode()) {
                            return messageNode.asText();
                        }
                    } catch (Exception e) {
                        log.debug("Skipping non-JSON chunk: {}", chunk);
                    }
                    return null;
                })
                .doOnComplete(() -> log.info("CHAT complete | user={}", username))
                .doOnError(e -> log.error("CHAT error | user={} error={}", username, e.getMessage()));
    }
}

