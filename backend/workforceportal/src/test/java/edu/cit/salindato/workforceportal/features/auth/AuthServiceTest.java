package edu.cit.salindato.workforceportal.features.auth;

import edu.cit.salindato.workforceportal.features.auth.dto.AuthResponseDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.ChangePasswordRequestDTO;
import edu.cit.salindato.workforceportal.features.auth.dto.UserRegistrationDTO;
import edu.cit.salindato.workforceportal.features.auth.model.User;
import edu.cit.salindato.workforceportal.features.auth.repository.UserRepository;
import edu.cit.salindato.workforceportal.features.auth.service.AuthService;
import edu.cit.salindato.workforceportal.security.PasswordEncoder;
import edu.cit.salindato.workforceportal.security.TokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private UserRegistrationDTO registrationDTO;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registrationDTO = new UserRegistrationDTO();
        registrationDTO.setEmail("test@cit.edu");
        registrationDTO.setFirstName("Juan");
        registrationDTO.setLastName("Dela Cruz");
        registrationDTO.setPassword("password123");

        mockUser = new User();
        mockUser.setId("123");
        mockUser.setEmail("test@cit.edu");
        mockUser.setPassword("hashed_password");
        mockUser.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("AUTH-01")
    void createAccount_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.hash(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        User createdUser = authService.createAccount(registrationDTO);

        assertNotNull(createdUser);
        assertEquals("test@cit.edu", createdUser.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("AUTH-02")
    void createAccount_DuplicateEmail() {
        when(userRepository.findByEmail("test@cit.edu")).thenReturn(Optional.of(mockUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.createAccount(registrationDTO);
        });

        assertEquals("User with this email already exists", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("AUTH-03")
    void authenticateUser_Success() {
        when(userRepository.findByEmail("test@cit.edu")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.verify("password123", "hashed_password")).thenReturn(true);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("mock_token");

        AuthResponseDTO response = authService.authenticateUser("test@cit.edu", "password123");

        assertNotNull(response);
        assertEquals("mock_token", response.getToken());
        verify(userRepository).save(any(User.class)); // Verifies token was updated in DB
    }

    @Test
    @DisplayName("AUTH-04")
    void authenticateUser_WrongPassword() {
        when(userRepository.findByEmail("test@cit.edu")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.verify("wrong_pass", "hashed_password")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> {
            authService.authenticateUser("test@cit.edu", "wrong_pass");
        });
    }

    @Test
    @DisplayName("Invalid Token")
    void getCurrentUser_InvalidToken() {
        when(userRepository.findByToken("invalid_token")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            authService.getCurrentUser("invalid_token");
        });
    }

    @Test
    @DisplayName("AUTH-05")
    void clearSession_Success() {
        String token = "valid_token";
        when(tokenProvider.validateToken(token)).thenReturn(true);

        assertDoesNotThrow(() -> authService.clearSession(token));
        verify(tokenProvider).validateToken(token);
    }

    @Test
    @DisplayName("AUTH-06 & AUTH-07")
    void changePassword_Success() {
        String token = "valid_token";
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO();
        dto.setOldPassword("old_pass");
        dto.setNewPassword("new_password_long");

        when(userRepository.findByToken(token)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.verify("old_pass", mockUser.getPassword())).thenReturn(true);
        when(passwordEncoder.verify("new_password_long", mockUser.getPassword())).thenReturn(false);
        when(passwordEncoder.hash("new_password_long")).thenReturn("new_hashed_pass");

        authService.changePassword(token, dto);

        verify(userRepository).save(mockUser);
        assertEquals("new_hashed_pass", mockUser.getPassword());
    }

    @Test
    @DisplayName("AUTH-08")
    void updateUserProfile_Success() {
        when(userRepository.findById("123")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        User updated = authService.updateUserProfile(mockUser, "NewName", "NewLast", "0912345", "url");

        assertEquals("NewName", updated.getFirstName());
        assertEquals("NewLast", updated.getLastName());
        verify(userRepository).save(any(User.class));
    }
}