package edu.cit.salindato.workforceportal.features.attendance;

import edu.cit.salindato.workforceportal.features.attendance.model.Attendance;
import edu.cit.salindato.workforceportal.features.attendance.repository.AttendanceRepository;
import edu.cit.salindato.workforceportal.features.attendance.service.AttendanceService;
import edu.cit.salindato.workforceportal.features.auth.model.User;
import edu.cit.salindato.workforceportal.features.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AttendanceService attendanceService;

    private User mockUser;
    private Attendance mockAttendance;
    private final String testToken = "mock-token";

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("user123");

        mockAttendance = Attendance.builder()
                .id("attn001")
                .userId("user123")
                .clockIn(LocalDateTime.now().minusHours(1))
                .status("PRESENT")
                .breakDuration(0)
                .build();
    }

    @Test
    @DisplayName("ATT-01")
    void clockIn_Success() {
        when(authService.getCurrentUser(testToken)).thenReturn(mockUser);
        when(attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(mockUser.getId()))
                .thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);

        Attendance result = attendanceService.clockIn(testToken);

        assertNotNull(result);
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    @DisplayName("ATT-02")
    void clockOut_Success() {
        when(authService.getCurrentUser(testToken)).thenReturn(mockUser);
        when(attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(mockUser.getId()))
                .thenReturn(Optional.of(mockAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);

        Attendance result = attendanceService.clockOut(testToken);

        assertEquals("COMPLETED", result.getStatus());
        assertNotNull(result.getClockOut());
        assertNotNull(result.getTotalHours());
        verify(attendanceRepository).save(mockAttendance);
    }

    @Test
    @DisplayName("ATT-03")
    void startBreak_Success() {
        when(authService.getCurrentUser(testToken)).thenReturn(mockUser);
        when(attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(mockUser.getId()))
                .thenReturn(Optional.of(mockAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);

        Attendance result = attendanceService.startBreak(testToken);

        assertEquals("ON_BREAK", result.getStatus());
        assertNotNull(result.getBreakStartedAt());
    }

    @Test
    @DisplayName("ATT-04")
    void endBreak_Success() {
        mockAttendance.setBreakStartedAt(LocalDateTime.now().minusMinutes(30));
        mockAttendance.setStatus("ON_BREAK");

        when(authService.getCurrentUser(testToken)).thenReturn(mockUser);
        when(attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(mockUser.getId()))
                .thenReturn(Optional.of(mockAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockAttendance);

        Attendance result = attendanceService.endBreak(testToken);

        assertEquals("PRESENT", result.getStatus());
        assertNull(result.getBreakStartedAt());
        assertTrue(result.getBreakDuration() > 0);
    }

    @Test
    @DisplayName("ATT-05")
    void getRecentAttendance_Success() {
        when(authService.getCurrentUser(testToken)).thenReturn(mockUser);
        when(attendanceRepository.findTop10ByUserIdOrderByClockInDesc(mockUser.getId()))
                .thenReturn(List.of(mockAttendance));

        List<Attendance> history = attendanceService.getRecentAttendance(testToken);

        assertFalse(history.isEmpty());
        assertEquals(1, history.size());
    }
}