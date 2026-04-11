package org.crypto.aiproject.controller;

import jakarta.validation.Valid;
import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.dto.AuthResponse;
import org.crypto.aiproject.dto.LoginRequest;
import org.crypto.aiproject.dto.RegistrationRequest;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/register
     * Body: { "firstName", "lastName", "email", "password" }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegistrationRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Registration successful! Check your email to confirm your account."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * GET /api/auth/confirm?token=xxx
     * Called when user clicks the link in the confirmation email,
     * or test it directly in Postman.
     */
    @GetMapping("/confirm")
    public ResponseEntity<ApiResponse> confirm(@RequestParam("token") String token) {
        try {
            String result = userService.confirmToken(token);
            return ResponseEntity.ok(new ApiResponse(true, result));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     * Body: { "email", "password" }
     * Returns JWT token on success.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            String jwt = userService.login(request);
            return ResponseEntity.ok(AuthResponse.ok("Login successful", jwt));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/auth/me
     * PROTECTED — requires Bearer token.
     * Returns the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Not authenticated"));
    }
}
