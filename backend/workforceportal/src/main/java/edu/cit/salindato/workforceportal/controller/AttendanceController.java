package edu.cit.salindato.workforceportal.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.salindato.workforceportal.model.Attendance;
import edu.cit.salindato.workforceportal.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            Attendance attendance = attendanceService.clockIn(parsedToken);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            Attendance attendance = attendanceService.clockOut(parsedToken);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/break/start")
    public ResponseEntity<?> startBreak(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            Attendance attendance = attendanceService.startBreak(parsedToken);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/break/end")
    public ResponseEntity<?> endBreak(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            Attendance attendance = attendanceService.endBreak(parsedToken);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyAttendance(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            List<Attendance> records = attendanceService.getRecentAttendance(parsedToken);
            boolean isClockedIn = attendanceService.isCurrentlyClockedIn(parsedToken);

            Map<String, Object> response = new HashMap<>();
            response.put("isClockedIn", isClockedIn);
            response.put("records", records);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private String parseBearerToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}
