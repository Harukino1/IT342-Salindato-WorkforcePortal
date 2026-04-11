package edu.cit.salindato.workforceportal.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.salindato.workforceportal.model.Attendance;
import edu.cit.salindato.workforceportal.model.User;
import edu.cit.salindato.workforceportal.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public Attendance clockIn(String token) {
        User user = authService.getCurrentUser(token);

        if (attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(user.getId()).isPresent()) {
            throw new RuntimeException("You are already clocked in");
        }

        Attendance attendance = Attendance.builder()
                .userId(user.getId())
                .date(LocalDate.now())
                .clockIn(LocalDateTime.now())
                .status("PRESENT")
                .breakDuration(0)
                .breakStartedAt(null)
                .build();

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance clockOut(String token) {
        User user = authService.getCurrentUser(token);

        Attendance attendance = getOpenAttendance(user.getId());

        if (attendance.getBreakStartedAt() != null) {
            int extraBreakSeconds = calculateBreakSeconds(attendance.getBreakStartedAt(), LocalDateTime.now());
            int currentBreakSeconds = attendance.getBreakDuration() == null ? 0 : Math.max(0, attendance.getBreakDuration());
            attendance.setBreakDuration(Math.max(0, currentBreakSeconds + extraBreakSeconds));
            attendance.setBreakStartedAt(null);
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setClockOut(now);

        int breakSeconds = attendance.getBreakDuration() == null ? 0 : Math.max(0, attendance.getBreakDuration());
        long workedSeconds = Math.max(0, Duration.between(attendance.getClockIn(), now).getSeconds() - breakSeconds);
        BigDecimal totalHours = BigDecimal.valueOf(workedSeconds)
            .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);

        attendance.setTotalHours(totalHours);
        attendance.setStatus("COMPLETED");

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance startBreak(String token) {
        User user = authService.getCurrentUser(token);
        Attendance attendance = getOpenAttendance(user.getId());

        if (attendance.getBreakStartedAt() != null) {
            throw new RuntimeException("Break already active");
        }

        attendance.setBreakStartedAt(LocalDateTime.now());
        attendance.setStatus("ON_BREAK");
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance endBreak(String token) {
        User user = authService.getCurrentUser(token);
        Attendance attendance = getOpenAttendance(user.getId());

        if (attendance.getBreakStartedAt() == null) {
            throw new RuntimeException("No active break found");
        }

        int extraBreakSeconds = calculateBreakSeconds(attendance.getBreakStartedAt(), LocalDateTime.now());
        int previousBreakSeconds = attendance.getBreakDuration() == null ? 0 : Math.max(0, attendance.getBreakDuration());

        attendance.setBreakDuration(Math.max(0, previousBreakSeconds + extraBreakSeconds));
        attendance.setBreakStartedAt(null);
        attendance.setStatus("PRESENT");
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getRecentAttendance(String token) {
        User user = authService.getCurrentUser(token);
        return attendanceRepository.findTop10ByUserIdOrderByClockInDesc(user.getId());
    }

    public boolean isCurrentlyClockedIn(String token) {
        User user = authService.getCurrentUser(token);
        return attendanceRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(user.getId()).isPresent();
    }

    private Attendance getOpenAttendance(String userId) {
        return attendanceRepository
                .findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(userId)
                .orElseThrow(() -> new RuntimeException("No active clock-in found"));
    }

    private int calculateBreakSeconds(LocalDateTime start, LocalDateTime end) {
        long breakSeconds = Math.max(0, Duration.between(start, end).getSeconds());
        return (int) breakSeconds;
    }
}
