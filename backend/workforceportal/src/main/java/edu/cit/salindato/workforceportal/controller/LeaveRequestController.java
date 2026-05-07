package edu.cit.salindato.workforceportal.controller;

import java.util.HashMap;
import java.util.List;
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

import edu.cit.salindato.workforceportal.dto.LeaveRequestPayload;
import edu.cit.salindato.workforceportal.model.LeaveRequest;
import edu.cit.salindato.workforceportal.service.LeaveRequestService;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @PostMapping
    public ResponseEntity<?> submitLeaveRequest(
            @RequestHeader("Authorization") String token,
            @RequestBody LeaveRequestPayload payload) {
        try {
            String parsedToken = parseBearerToken(token);
            LeaveRequest request = leaveRequestService.createLeaveRequest(payload, parsedToken);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyLeaveRequests(@RequestHeader("Authorization") String token) {
        try {
            String parsedToken = parseBearerToken(token);
            List<LeaveRequest> requests = leaveRequestService.getLeaveRequestsByUser(parsedToken);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    private String parseBearerToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}