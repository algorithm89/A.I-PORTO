package org.crypto.aiproject.controller;

import jakarta.validation.Valid;
import org.crypto.aiproject.dto.ChatRequest;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
     * Works for both logged-in users and anonymous visitors.
     */
    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@Valid @RequestBody ChatRequest request) {
        String username = "guest";
        boolean loggedIn = false;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            username = user.getUsername();
            loggedIn = true;
        }

        return chatService.streamChat(username, loggedIn, request);
    }
}
