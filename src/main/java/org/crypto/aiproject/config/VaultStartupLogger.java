package org.crypto.aiproject.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Logs Vault-related configuration state at startup.
 * Never logs actual secret values — only whether they were loaded.
 */
@Component
public class VaultStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(VaultStartupLogger.class);

    @Value("${spring.cloud.vault.uri:NOT_SET}")
    private String vaultUri;

    @Value("${spring.cloud.vault.kv.backend:NOT_SET}")
    private String vaultBackend;

    @Value("${spring.cloud.vault.kv.default-context:NOT_SET}")
    private String vaultContext;

    @Value("${spring.cloud.vault.fail-fast:false}")
    private boolean vaultFailFast;

    // These come FROM Vault — check if they were injected
    @Value("${jwt.secret:NOT_LOADED}")
    private String jwtSecret;

    @Value("${spring.datasource.password:NOT_LOADED}")
    private String dbPassword;

    @Value("${mailtrap.token:NOT_LOADED}")
    private String mailtrapToken;

    @EventListener(ApplicationReadyEvent.class)
    public void logVaultStatus() {
        log.info("========================================================");
        log.info("              VAULT STARTUP STATUS                      ");
        log.info("========================================================");
        log.info("  Vault URI       : {}", vaultUri);
        log.info("  KV backend      : {}", vaultBackend);
        log.info("  KV context      : {}", vaultContext);
        log.info("  Fail-fast       : {}", vaultFailFast);
        log.info("--------------------------------------------------------");
        log.info("  jwt.secret      : {}", mask(jwtSecret));
        log.info("  db.password     : {}", mask(dbPassword));
        log.info("  mailtrap.token  : {}", mask(mailtrapToken));
        log.info("--------------------------------------------------------");

        boolean allLoaded = isLoaded(jwtSecret) && isLoaded(dbPassword) && isLoaded(mailtrapToken);
        if (allLoaded) {
            log.info("  [OK] All Vault secrets loaded successfully");
        } else {
            log.warn("  [WARN] Some Vault secrets are MISSING!");
            if (!isLoaded(jwtSecret))     log.warn("    [X] jwt.secret - NOT loaded from Vault");
            if (!isLoaded(dbPassword))    log.warn("    [X] spring.datasource.password - NOT loaded");
            if (!isLoaded(mailtrapToken)) log.warn("    [X] mailtrap.token - NOT loaded from Vault");
        }
        log.info("========================================================");
    }

    private boolean isLoaded(String value) {
        return value != null && !value.equals("NOT_LOADED") && !value.isBlank();
    }

    /** Show only that the secret was loaded + its length — never leak characters */
    private String mask(String value) {
        if (!isLoaded(value)) return "[X] NOT_LOADED";
        return "[OK] ******** (" + value.length() + " chars)";
    }
}
