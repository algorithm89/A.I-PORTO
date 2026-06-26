package org.crypto.aiproject.controller;

import jakarta.validation.Valid;
import org.crypto.aiproject.dto.ApiResponse;
import org.crypto.aiproject.dto.BillingRequest;
import org.crypto.aiproject.entity.Billing;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.service.BillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Secret billing page API. Access is restricted to the page admin (ADMIN role)
 * plus any email on the billing allowlist (e.g. the roommate). There is no
 * link to this page in the site nav — it's reached directly at /billing.
 */
@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private static final Logger log = LoggerFactory.getLogger(BillingController.class);

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    /** The authenticated user, or null if somehow unauthenticated. */
    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (principal instanceof User user) ? user : null;
    }

    /** ADMIN role OR an allowlisted email may use the billing page. */
    private boolean canAccess(User user) {
        if (user == null) return false;
        return "ADMIN".equalsIgnoreCase(user.getRole()) || billingService.isAllowed(user.getUsername());
    }

    /** GET /api/billing — list all recorded payments. */
    @GetMapping
    public ResponseEntity<?> list() {
        User user = currentUser();
        if (!canAccess(user)) {
            log.warn("BILLING denied | user={} action=LIST", user == null ? "anon" : user.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "You do not have access to the billing page"));
        }
        return ResponseEntity.ok(billingService.list());
    }

    /** GET /api/billing/access — lets the frontend check access before showing the page. */
    @GetMapping("/access")
    public ResponseEntity<ApiResponse> access() {
        boolean ok = canAccess(currentUser());
        return ResponseEntity.status(ok ? HttpStatus.OK : HttpStatus.FORBIDDEN)
                .body(new ApiResponse(ok, ok ? "ok" : "no access"));
    }

    /** POST /api/billing — record a new payment and email admin + payer. */
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BillingRequest request) {
        User user = currentUser();
        if (!canAccess(user)) {
            log.warn("BILLING denied | user={} action=CREATE", user == null ? "anon" : user.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "You do not have access to the billing page"));
        }
        Billing saved = billingService.create(request, user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** DELETE /api/billing/{id} — remove a recorded payment. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        User user = currentUser();
        if (!canAccess(user)) {
            log.warn("BILLING denied | user={} action=DELETE id={}", user == null ? "anon" : user.getUsername(), id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "You do not have access to the billing page"));
        }
        try {
            billingService.delete(id);
            log.info("BILLING delete | id={} by={}", id, user.getUsername());
            return ResponseEntity.ok(new ApiResponse(true, "Payment deleted"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
