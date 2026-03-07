package edu.cit.salindato.workforceportal.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.salindato.workforceportal.dto.AuthResponseDTO;
import edu.cit.salindato.workforceportal.dto.UserRegistrationDTO;
import edu.cit.salindato.workforceportal.model.User;
import edu.cit.salindato.workforceportal.repository.UserRepository;
import edu.cit.salindato.workforceportal.security.PasswordEncoder;
import edu.cit.salindato.workforceportal.security.TokenProvider;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenProvider tokenProvider;

    @Transactional
    public User createAccount(UserRegistrationDTO userData) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(userData.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(userData.getEmail());
        newUser.setFirstName(userData.getFirstName());
        newUser.setLastName(userData.getLastName());
        newUser.setPassword(passwordEncoder.hash(userData.getPassword()));
        newUser.setPhoneNumber(userData.getPhoneNumber());
        newUser.setRole(userData.getRole() != null ? userData.getRole() : "USER");
        newUser.setStatus("ACTIVE");

        return userRepository.save(newUser);
    }

    public AuthResponseDTO authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.verify(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Check if user is active
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User account is not active");
        }

        // Generate token
        String token = tokenProvider.generateToken(user);

        if (!token.equals(user.getToken())){
            user.setToken(token);
            userRepository.save(user);
        }

        return new AuthResponseDTO(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }

    public void clearSession(String token) {
        // In a real implementation, you might want to:
        // 1. Add token to a blacklist
        // 2. Remove from active sessions
        // 3. Perform cleanup
        // For now, we'll just validate the token was valid
        if (!tokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }
    }

    public User getCurrentUser(String token) {
        // Find user by token
        return userRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired session"));
    }

    @Transactional
    public void updateUserStatus(String userId, String newStatus) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setStatus(newStatus);
        userRepository.save(user);
    }
}
