package edu.cit.salindato.workforceportal.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordEncoder {

    private final BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder();

    public String hash(String rawPassword) {
        return bcryptEncoder.encode(rawPassword);
    }

    public boolean verify(String rawPassword, String storedHash) {
        return bcryptEncoder.matches(rawPassword, storedHash);
    }
}