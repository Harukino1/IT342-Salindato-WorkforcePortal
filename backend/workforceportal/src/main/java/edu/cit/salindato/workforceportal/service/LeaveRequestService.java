package edu.cit.salindato.workforceportal.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import edu.cit.salindato.workforceportal.dto.LeaveRequestPayload;
import edu.cit.salindato.workforceportal.model.LeaveRequest;
import edu.cit.salindato.workforceportal.model.User;
import edu.cit.salindato.workforceportal.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final AuthService authService;

    public LeaveRequest createLeaveRequest(LeaveRequestPayload payload, String token) {
        User user = authService.getCurrentUser(token);

        if (payload.getStartDate() == null || payload.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }

        if (payload.getEndDate().isBefore(payload.getStartDate())) {
            throw new RuntimeException("End date cannot be earlier than start date");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(payload.getStartDate(), payload.getEndDate()) + 1;

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .subject(payload.getSubject())
                .leaveType(payload.getLeaveType())
                .startDate(payload.getStartDate())
                .endDate(payload.getEndDate())
                .totalDays(totalDays)
                .body(payload.getBody())
                .userId(user.getId())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return leaveRequestRepository.save(leaveRequest);
    }
    
    public List<LeaveRequest> getLeaveRequestsByUser(String token) {
        User user = authService.getCurrentUser(token);
        return leaveRequestRepository.findByUserId(user.getId());
    }
}