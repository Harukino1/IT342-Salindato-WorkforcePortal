package edu.cit.salindato.workforceportal.features.auth.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.salindato.workforceportal.features.auth.dto.AuthResponseDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.UserRegistrationDTO;
import edu.cit.salindato.workforceportal.features.auth.model.User;
import edu.cit.salindato.workforceportal.features.auth.repository.UserRepository;
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
        Optional<User> existingUser = userRepository.findByEmail(userData.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

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

        if (!passwordEncoder.verify(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User account is not active");
        }

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
        if (!tokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }
    }

    public User getCurrentUser(String token) {
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

    @Transactional
    public User updateUserProfile(User user, String firstName, String lastName, String phoneNumber, String avatarUrl) {
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }
}
