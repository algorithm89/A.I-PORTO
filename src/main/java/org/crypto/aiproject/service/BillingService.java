package org.crypto.aiproject.service;

import org.crypto.aiproject.dto.BillingRequest;
import org.crypto.aiproject.entity.Billing;
import org.crypto.aiproject.repository.BillingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final BillingRepository billingRepository;
    private final EmailService emailService;

    /** Comma-separated addresses that always receive billing notifications. */
    @Value("${billing.admin-emails}")
    private String adminEmails;

    /** Comma-separated usernames (besides ADMIN) allowed to use the billing page, e.g. the roommate "cappy". */
    @Value("${billing.allowed-usernames:cappy}")
    private String allowedUsernames;

    public BillingService(BillingRepository billingRepository, EmailService emailService) {
        this.billingRepository = billingRepository;
        this.emailService = emailService;
    }

    /** True if this username (besides any ADMIN role) may use the billing page. */
    public boolean isAllowed(String username) {
        if (username == null) return false;
        Set<String> allowed = Arrays.stream(allowedUsernames.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        return allowed.contains(username.trim().toLowerCase());
    }

    public List<Billing> list() {
        return billingRepository.findAllByOrderByPaymentDateDescIdDesc();
    }

    public void delete(Long id) {
        if (!billingRepository.existsById(id)) {
            throw new IllegalStateException("Payment not found");
        }
        billingRepository.deleteById(id);
        log.info("BILLING deleted | id={}", id);
    }

    public Billing create(BillingRequest request, String createdBy) {
        Billing billing = new Billing(
                request.getPayerEmail().trim(),
                request.getAmount(),
                request.getPaymentDate(),
                request.getMethod().toUpperCase(),
                request.getNote(),
                createdBy
        );
        Billing saved = billingRepository.save(billing);
        log.info("BILLING created | id={} payer={} amount={} method={} by={}",
                saved.getId(), saved.getPayerEmail(), saved.getAmount(), saved.getMethod(), createdBy);

        // Notify the admin address(es) and the person the payment is associated with.
        List<String> recipients = new ArrayList<>();
        Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(recipients::add);
        recipients.add(saved.getPayerEmail());
        emailService.sendBillingNotification(
                recipients.stream().distinct().collect(Collectors.toList()),
                saved.getPayerEmail(),
                saved.getAmount().toPlainString(),
                saved.getPaymentDate().toString(),
                saved.getMethod(),
                saved.getNote(),
                createdBy
        );

        return saved;
    }
}
