package edu.cit.salindato.workforceportal.features.auth.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.salindato.workforceportal.features.auth.dto.AuthResponseDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.ChangePasswordRequestDTO;
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
        // Normalize role: default to "Member". Accept legacy 'USER' value and map to 'Member'.
        String incomingRole = userData.getRole();
        String normalizedRole;
        if (incomingRole == null) {
            normalizedRole = "Member";
        } else if ("USER".equalsIgnoreCase(incomingRole)) {
            normalizedRole = "Member";
        } else {
            normalizedRole = incomingRole;
        }
        newUser.setRole(normalizedRole);
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
    public void changePassword(String token, ChangePasswordRequestDTO payload) {
        if (payload == null) {
            throw new RuntimeException("Request body is required");
        }

        String oldPassword = payload.getOldPassword() != null ? payload.getOldPassword().trim() : "";
        String newPassword = payload.getNewPassword() != null ? payload.getNewPassword().trim() : "";

        if (oldPassword.isEmpty() || newPassword.isEmpty()) {
            throw new RuntimeException("Old password and new password are required");
        }

        if (newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }

        User user = getCurrentUser(token);

        if (!passwordEncoder.verify(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        if (passwordEncoder.verify(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.hash(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User updateUserProfile(
            User currentUser,
            String firstName,
            String lastName,
            String phoneNumber,
            String avatarUrl
    ) {
        if (currentUser == null || currentUser.getId() == null) {
            throw new RuntimeException("Invalid user session");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String normalizedFirstName = firstName != null ? firstName.trim() : null;
        String normalizedLastName = lastName != null ? lastName.trim() : null;
        String normalizedPhoneNumber = phoneNumber != null ? phoneNumber.trim() : null;
        String normalizedAvatarUrl = avatarUrl != null ? avatarUrl.trim() : null;

        if (normalizedFirstName != null && !normalizedFirstName.isEmpty()) {
            user.setFirstName(normalizedFirstName);
        }

        if (normalizedLastName != null && !normalizedLastName.isEmpty()) {
            user.setLastName(normalizedLastName);
        }

        if (phoneNumber != null) {
            user.setPhoneNumber(normalizedPhoneNumber);
        }

        if (normalizedAvatarUrl != null && !normalizedAvatarUrl.isEmpty()) {
            user.setAvatarUrl(normalizedAvatarUrl);
        }

        return userRepository.save(user);
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
