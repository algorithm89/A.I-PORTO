package org.crypto.aiproject.config;

import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Password used when first seeding the admin user. If blank, a random one is generated and logged. */
    @Value("${admin.seed-password:}")
    private String adminSeedPassword;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            boolean generated = (adminSeedPassword == null || adminSeedPassword.isBlank());
            String rawPassword = generated ? java.util.UUID.randomUUID().toString() : adminSeedPassword;
            User admin = new User("admin", "admin@bublikstudios.net", passwordEncoder.encode(rawPassword));
            admin.setRole("ADMIN");
            admin.setEnabled(true);
            userRepository.save(admin);
            if (generated) {
                log.warn("✅ Admin user created with a RANDOM password (set ADMIN_SEED_PASSWORD to choose one): {}", rawPassword);
            } else {
                log.info("✅ Admin user created — username: admin (password from ADMIN_SEED_PASSWORD)");
            }
        } else {
            log.info("ℹ️ Admin user already exists, skipping seed.");
        }
    }
}
