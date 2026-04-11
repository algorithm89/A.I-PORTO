package org.crypto.aiproject.controller;

import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /** Returns the username of the currently authenticated admin */
    private String currentAdmin() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) return user.getUsername();
        return "unknown";
    }

    /** GET /api/admin/users — list all users (ADMIN only) */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("ADMIN action | admin={} action=LIST_USERS", currentAdmin());
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** DELETE /api/admin/users/{id} — delete user by ID */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        log.info("ADMIN action | admin={} action=DELETE_USER userId={}", currentAdmin(), id);
        try {
            userService.deleteUser(id);
            log.info("ADMIN result | admin={} action=DELETE_USER userId={} result=SUCCESS", currentAdmin(), id);
            return ResponseEntity.ok(new ApiResponse(true, "User deleted"));
        } catch (IllegalStateException e) {
            log.warn("ADMIN result | admin={} action=DELETE_USER userId={} result=FAILED reason={}", currentAdmin(), id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /** PATCH /api/admin/users/{id}/role?role=ADMIN — toggle role */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse> updateRole(@PathVariable Long id, @RequestParam String role) {
        log.info("ADMIN action | admin={} action=UPDATE_ROLE userId={} newRole={}", currentAdmin(), id, role);
        try {
            userService.updateRole(id, role);
            log.info("ADMIN result | admin={} action=UPDATE_ROLE userId={} newRole={} result=SUCCESS", currentAdmin(), id, role);
            return ResponseEntity.ok(new ApiResponse(true, "Role updated to " + role));
        } catch (IllegalStateException e) {
            log.warn("ADMIN result | admin={} action=UPDATE_ROLE userId={} result=FAILED reason={}", currentAdmin(), id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /** PATCH /api/admin/users/{id}/enabled?enabled=true — toggle enabled */
    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<ApiResponse> updateEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        log.info("ADMIN action | admin={} action=TOGGLE_ENABLED userId={} enabled={}", currentAdmin(), id, enabled);
        try {
            userService.updateEnabled(id, enabled);
            log.info("ADMIN result | admin={} action=TOGGLE_ENABLED userId={} enabled={} result=SUCCESS", currentAdmin(), id, enabled);
            return ResponseEntity.ok(new ApiResponse(true, "User " + (enabled ? "enabled" : "disabled")));
        } catch (IllegalStateException e) {
            log.warn("ADMIN result | admin={} action=TOGGLE_ENABLED userId={} result=FAILED reason={}", currentAdmin(), id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}

