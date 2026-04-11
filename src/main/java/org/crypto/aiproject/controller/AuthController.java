package org.crypto.aiproject.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.dto.AuthResponse;
import org.crypto.aiproject.dto.LoginRequest;
import org.crypto.aiproject.dto.RegistrationRequest;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/register
     * Body: { "firstName", "lastName", "email", "password" }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegistrationRequest request,
                                                HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        log.info("REGISTER attempt | username={} email={} ip={}", request.getUsername(), request.getEmail(), ip);
        try {
            userService.register(request);
            log.info("REGISTER success | username={} email={}", request.getUsername(), request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Registration successful! Check your email to confirm your account."));
        } catch (IllegalStateException e) {
            log.warn("REGISTER failed  | username={} email={} reason={}", request.getUsername(), request.getEmail(), e.getMessage());
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
    public ResponseEntity<ApiResponse> confirm(@RequestParam("token") String token,
                                               HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        log.info("CONFIRM attempt | token={}... ip={}", token.substring(0, Math.min(8, token.length())), ip);
        try {
            String result = userService.confirmToken(token);
            log.info("CONFIRM success | token={}...", token.substring(0, Math.min(8, token.length())));
            return ResponseEntity.ok(new ApiResponse(true, result));
        } catch (IllegalStateException e) {
            log.warn("CONFIRM failed  | reason={}", e.getMessage());
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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        log.info("LOGIN attempt | username={} ip={}", request.getUsername(), ip);
        try {
            String jwt = userService.login(request);
            // Fetch user to log role
            log.info("LOGIN success | username={} ip={}", request.getUsername(), ip);
            return ResponseEntity.ok(AuthResponse.ok("Login successful", jwt));
        } catch (IllegalStateException e) {
            log.warn("LOGIN failed  | username={} ip={} reason={}", request.getUsername(), ip, e.getMessage());
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
    public ResponseEntity<?> me(HttpServletRequest httpRequest) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            log.info("ME accessed | username={} role={} ip={}", user.getUsername(), user.getRole(), getClientIp(httpRequest));
            return ResponseEntity.ok(user);
        }
        log.warn("ME unauthorized | ip={}", getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Not authenticated"));
    }

    /** Extract real client IP (works behind Nginx / CDN) */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }
}
