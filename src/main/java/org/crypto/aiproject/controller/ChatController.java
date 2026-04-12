package org.crypto.aiproject.controller;

import jakarta.validation.Valid;
import org.crypto.aiproject.dto.ChatRequest;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
public class ChatController {


    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * POST /api/chat
     * Streams the AI response token-by-token via Server-Sent Events.
     * Requires authentication (Bearer JWT).
     */
    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@Valid @RequestBody ChatRequest request,
                             @AuthenticationPrincipal User user) {
        String username = (user != null) ? user.getUsername() : "anonymous";
        return chatService.streamChat(username, request);
    }
}

