package org.crypto.aiproject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String MAILTRAP_SEND_URL = "https://send.api.mailtrap.io/api/send";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mailtrap.token}")
    private String mailtrapToken;

    @Value("${mailtrap.from-email}")
    private String fromEmail;

    @Value("${mailtrap.from-name}")
    private String fromName;

    @Async
    public void sendConfirmationEmail(String to, String name, String link) {
        try {
            String htmlContent = buildEmail(name, link);

            Map<String, Object> body = Map.of(
                    "from", Map.of("email", fromEmail, "name", fromName),
                    "to", List.of(Map.of("email", to)),
                    "subject", "Confirm your email - BublikStudios",
                    "html", htmlContent,
                    "category", "Email Confirmation"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(mailtrapToken);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.exchange(MAILTRAP_SEND_URL, HttpMethod.POST, request, String.class);

            log.info("Confirmation email sent to {} — status: {} body: {}", to, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new IllegalStateException("Failed to send email", e);
        }
    }

    /**
     * Notify the recipients about a newly recorded payment.
     * Sent to the page admin and the email the payment is associated with.
     */
    @Async
    public void sendBillingNotification(List<String> recipients, String payerEmail, String amount,
                                        String paymentDate, String method, String note, String signature, String enteredBy) {
        try {
            String htmlContent = buildBillingEmail(payerEmail, amount, paymentDate, method, note, signature, enteredBy);

            List<Map<String, Object>> to = recipients.stream()
                    .distinct()
                    .map(addr -> Map.<String, Object>of("email", addr))
                    .toList();

            Map<String, Object> body = Map.of(
                    "from", Map.of("email", fromEmail, "name", fromName),
                    "to", to,
                    "subject", "New payment recorded - BublikStudios Billing",
                    "html", htmlContent,
                    "category", "Billing"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(mailtrapToken);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.exchange(MAILTRAP_SEND_URL, HttpMethod.POST, request, String.class);

            log.info("Billing email sent to {} — status: {}", recipients, response.getStatusCode());
        } catch (Exception e) {
            // Don't let an email failure lose the recorded payment — it's already saved.
            log.error("Failed to send billing email to {}", recipients, e);
        }
    }

    private String buildBillingEmail(String payerEmail, String amount, String paymentDate,
                                     String method, String note, String signature, String enteredBy) {
        String methodLabel = "ETRANSFER".equalsIgnoreCase(method) ? "E-transfer" : "Cash";
        String noteRow = (note == null || note.isBlank())
                ? ""
                : "<tr><td style=\"padding:8px 0;color:#888;\">Note</td><td style=\"padding:8px 0;text-align:right;font-weight:bold;\">%s</td></tr>".formatted(note);
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .header { background-color: #1a1a2e; color: #ffffff; padding: 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 22px; }
                        .body-content { padding: 30px; color: #333333; }
                        table { width: 100%%; border-collapse: collapse; }
                        td { border-bottom: 1px solid #eee; font-size: 15px; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999999; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Payment Recorded</h1>
                        </div>
                        <div class="body-content">
                            <p>A new payment has been recorded in the billing page:</p>
                            <table>
                                <tr><td style="padding:8px 0;color:#888;">Associated email</td><td style="padding:8px 0;text-align:right;font-weight:bold;">%s</td></tr>
                                <tr><td style="padding:8px 0;color:#888;">Amount</td><td style="padding:8px 0;text-align:right;font-weight:bold;">$%s</td></tr>
                                <tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;text-align:right;font-weight:bold;">%s</td></tr>
                                <tr><td style="padding:8px 0;color:#888;">Method</td><td style="padding:8px 0;text-align:right;font-weight:bold;">%s</td></tr>
                                %s
                                <tr><td style="padding:8px 0;color:#888;">Signed by</td><td style="padding:8px 0;text-align:right;font-weight:bold;font-style:italic;">%s</td></tr>
                                <tr><td style="padding:8px 0;color:#888;">Entered by</td><td style="padding:8px 0;text-align:right;font-weight:bold;">%s</td></tr>
                            </table>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 BublikStudios. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(payerEmail, amount, paymentDate, methodLabel, noteRow, signature, enteredBy);
    }

    private String buildEmail(String name, String link) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .header { background-color: #1a1a2e; color: #ffffff; padding: 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .body-content { padding: 30px; color: #333333; }
                        .body-content p { line-height: 1.6; }
                        .btn { display: inline-block; padding: 14px 28px; background-color: #e94560; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999999; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>BublikStudios</h1>
                        </div>
                        <div class="body-content">
                            <p>Hi %s,</p>
                            <p>Thank you for registering! Please click the button below to confirm your email address:</p>
                            <p style="text-align: center;">
                                <a href="%s" class="btn">Confirm Email</a>
                            </p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 BublikStudios. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(name, link);
    }
}
