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

    private String buildEmail(String name, String link) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Confirm your email</title>
                </head>
                <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:16px;overflow:hidden;box-shadow:0 0 80px rgba(0,229,255,0.08),0 32px 64px rgba(0,0,0,0.6);">

                        <!-- Gradient top bar -->
                        <tr><td style="height:4px;background:linear-gradient(90deg,#00e5ff,#bd00ff,#ff2d78);"></td></tr>

                        <!-- Logo header -->
                        <tr><td style="padding:40px 40px 20px;text-align:center;">
                          <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">
                            <span style="color:#ffffff;">Bublik</span><span style="color:#00e5ff;">Studios</span>
                          </h1>
                          <p style="margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;">Email Confirmation</p>
                        </td></tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,0.3),transparent);"></div></td></tr>

                        <!-- Body -->
                        <tr><td style="padding:32px 40px;">
                          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Hey %s 👋</p>
                          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#a0a0b0;">
                            Welcome to <strong style="color:#00e5ff;">BublikStudios</strong>! You're one click away from unlocking your account. Tap the button below to verify your email and get started.
                          </p>

                          <!-- CTA Button -->
                          <table width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 28px;">
                            <a href="%s" target="_blank" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#00e5ff,#bd00ff);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;box-shadow:0 0 30px rgba(0,229,255,0.35),0 8px 24px rgba(0,0,0,0.4);letter-spacing:0.5px;">
                              ✦ Confirm Email
                            </a>
                          </td></tr></table>

                          <!-- Security info -->
                          <table width="100%%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
                            <tr><td style="padding:16px 20px;">
                              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1.5px;">🔒 Security Info</p>
                              <p style="margin:0;font-size:13px;line-height:1.6;color:#707080;">
                                This link expires in <strong style="color:#ffc800;">24 hours</strong>. If you didn't create this account, just ignore this email — nothing will happen.
                              </p>
                            </td></tr>
                          </table>
                        </td></tr>

                        <!-- Footer -->
                        <tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div></td></tr>
                        <tr><td style="padding:24px 40px 32px;text-align:center;">
                          <p style="margin:0 0 6px;font-size:11px;color:#444;">
                            &copy; 2026 <strong>BublikStudios</strong>. All rights reserved.
                          </p>
                          <p style="margin:0;font-size:10px;color:#333;">
                            Sent with ❤️ from the studio · No spam, ever.
                          </p>
                        </td></tr>

                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(name, link);
    }
}
