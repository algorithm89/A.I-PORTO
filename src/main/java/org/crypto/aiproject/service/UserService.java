package org.crypto.aiproject.service;

import org.crypto.aiproject.dto.LoginRequest;
import org.crypto.aiproject.dto.RegistrationRequest;
import org.crypto.aiproject.entity.ConfirmationToken;
import org.crypto.aiproject.entity.User;
import org.crypto.aiproject.repository.ConfirmationTokenRepository;
import org.crypto.aiproject.repository.UserRepository;
import org.crypto.aiproject.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ConfirmationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.base-url}")
    private String baseUrl;

    public UserService(UserRepository userRepository,
                       ConfirmationTokenRepository tokenRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public String register(RegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );
        userRepository.save(user);

        ConfirmationToken confirmationToken = new ConfirmationToken(user);
        tokenRepository.save(confirmationToken);

        String link = baseUrl + "/api/auth/confirm?token=" + confirmationToken.getToken();
        emailService.sendConfirmationEmail(
                user.getEmail(),
                user.getUsername(),
                link
        );

        return confirmationToken.getToken();
    }

    @Transactional
    public String confirmToken(String token) {
        ConfirmationToken confirmationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("Token not found"));

        if (confirmationToken.getConfirmedAt() != null) {
            throw new IllegalStateException("Email already confirmed");
        }

        if (confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token has expired");
        }

        confirmationToken.setConfirmedAt(LocalDateTime.now());
        tokenRepository.save(confirmationToken);

        User user = confirmationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        return "Email confirmed successfully! Your account is now active.";
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalStateException("Invalid username or password");
        }

        if (!user.getEnabled()) {
            throw new IllegalStateException("Please confirm your email before logging in");
        }

        return jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        tokenRepository.deleteAllByUser(user);
        userRepository.delete(user);
    }

    @Transactional
    public void updateRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void updateEnabled(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }
}
