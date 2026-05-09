package edu.cit.salindato.workforceportal.features.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.salindato.workforceportal.features.auth.dto.AuthRequestDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.AuthResponseDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.UserRegistrationDTO;
import edu.cit.salindato.workforceportal.features.auth.model.User;
import edu.cit.salindato.workforceportal.features.auth.service.AuthService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
        try {
            AuthResponseDTO response = authService.authenticateUser(
                    authRequest.getEmail(),
                    authRequest.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            authService.clearSession(token);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Logout successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDTO registrationDTO) {
        try {
            User user = authService.createAccount(registrationDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getFirstName() + " " + user.getLastName());
            response.put("role", user.getRole());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            User user = authService.getCurrentUser(token);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("avatarUrl", user.getAvatarUrl());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping(value = "/user/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfileMultipart(
            @RequestHeader("Authorization") String token,
            @RequestPart(value = "firstName", required = false) String firstName,
            @RequestPart(value = "lastName", required = false) String lastName,
            @RequestPart(value = "phoneNumber", required = false) String phoneNumber,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            User current = authService.getCurrentUser(token);

            String avatarUrl = null;
            if (avatar != null && !avatar.isEmpty()) {
                // Save uploaded file to resources/static/uploads
                String uploadsDir = "src/main/resources/static/uploads";
                File dir = new File(uploadsDir);
                if (!dir.exists()) dir.mkdirs();
                String ext = "";
                String original = avatar.getOriginalFilename();
                if (original != null && original.contains(".")) {
                    ext = original.substring(original.lastIndexOf('.'));
                }
                String filename = UUID.randomUUID().toString() + ext;
                File dest = new File(dir, filename);
                try {
                    avatar.transferTo(dest);
                    avatarUrl = "/uploads/" + filename;
                } catch (IOException ioe) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Failed to save avatar");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
                }
            }

            User updated = authService.updateUserProfile(current, firstName, lastName, phoneNumber, avatarUrl);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", updated.getId());
            resp.put("email", updated.getEmail());
            resp.put("firstName", updated.getFirstName());
            resp.put("lastName", updated.getLastName());
            resp.put("phoneNumber", updated.getPhoneNumber());
            resp.put("avatarUrl", updated.getAvatarUrl());
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping(value = "/user/profile", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProfileJson(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            User current = authService.getCurrentUser(token);

            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phoneNumber = (String) payload.get("phoneNumber");

            User updated = authService.updateUserProfile(current, firstName, lastName, phoneNumber, null);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", updated.getId());
            resp.put("email", updated.getEmail());
            resp.put("firstName", updated.getFirstName());
            resp.put("lastName", updated.getLastName());
            resp.put("phoneNumber", updated.getPhoneNumber());
            resp.put("avatarUrl", updated.getAvatarUrl());
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
