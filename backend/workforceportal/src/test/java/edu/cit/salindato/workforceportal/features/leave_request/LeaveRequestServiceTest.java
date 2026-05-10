package edu.cit.salindato.workforceportal.features.leave_request;

import edu.cit.salindato.workforceportal.features.auth.model.User;
import edu.cit.salindato.workforceportal.features.auth.service.AuthService;
import edu.cit.salindato.workforceportal.features.leave_request.dto.LeaveRequestPayload;
import edu.cit.salindato.workforceportal.features.leave_request.model.LeaveRequest;
import edu.cit.salindato.workforceportal.features.leave_request.repository.LeaveRequestRepository;
import edu.cit.salindato.workforceportal.features.leave_request.service.LeaveRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LeaveRequestServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private LeaveRequestService leaveRequestService;

    private User mockUser;
    private LeaveRequestPayload payload;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("user_789");

        payload = new LeaveRequestPayload();
        payload.setSubject("Vacation Leave");
        payload.setLeaveType("VACATION");
        payload.setStartDate(LocalDate.now().plusDays(1));
        payload.setEndDate(LocalDate.now().plusDays(3)); // 3 days total (inclusive)
        payload.setBody("Going to Cebu for a break.");
    }

    @Test
    @DisplayName("LEAVE-01")
    void createLeaveRequest_Success() {
        // Arrange
        when(authService.getCurrentUser("valid_token")).thenReturn(mockUser);
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        LeaveRequest result = leaveRequestService.createLeaveRequest(payload, "valid_token");

        // Assert
        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        assertEquals(3, result.getTotalDays()); // Verification of the ChronoUnit logic
        assertEquals("user_789", result.getUserId());
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
    }

    @Test
    @DisplayName("LEAVE-02")
    void createLeaveRequest_InvalidDates() {
        // Arrange
        payload.setEndDate(LocalDate.now().minusDays(5)); // Set end date in the past
        when(authService.getCurrentUser("valid_token")).thenReturn(mockUser);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            leaveRequestService.createLeaveRequest(payload, "valid_token");
        });

        assertEquals("End date cannot be earlier than start date", exception.getMessage());
        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }
}