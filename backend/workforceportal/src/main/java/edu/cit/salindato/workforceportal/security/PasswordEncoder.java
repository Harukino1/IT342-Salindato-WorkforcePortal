package edu.cit.salindato.workforceportal.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordEncoder {
    @Value("${password.encoder.salt:}")
    private String salt;

    @Value("${password.encoder.algorithm:BCrypt}")
    private String algorithm;

    private final BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder();

    // Hashes a raw password using BCrypt and an optional configured salt.
    public String hash(String rawPassword) {
        if (salt != null && !salt.isEmpty()) {
            rawPassword = rawPassword + salt;
        }
        return bcryptEncoder.encode(rawPassword);
    }

    // Verifies a raw password against a stored BCrypt hash.
    public boolean verify(String rawPassword, String storedHash) {
        if (salt != null && !salt.isEmpty()) {
            rawPassword = rawPassword + salt;
        }
        return bcryptEncoder.matches(rawPassword, storedHash);
    }
}
