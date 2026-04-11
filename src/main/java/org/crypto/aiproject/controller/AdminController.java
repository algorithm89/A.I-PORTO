package org.crypto.aiproject.controller;

import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /** GET /api/admin/users — list all users (ADMIN only) */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** DELETE /api/admin/users/{id} — delete user by ID */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse(true, "User deleted"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /** PATCH /api/admin/users/{id}/role?role=ADMIN — toggle role */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse> updateRole(@PathVariable Long id, @RequestParam String role) {
        try {
            userService.updateRole(id, role);
            return ResponseEntity.ok(new ApiResponse(true, "Role updated to " + role));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /** PATCH /api/admin/users/{id}/enabled?enabled=true — toggle enabled */
    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<ApiResponse> updateEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        try {
            userService.updateEnabled(id, enabled);
            return ResponseEntity.ok(new ApiResponse(true, "User " + (enabled ? "enabled" : "disabled")));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}

