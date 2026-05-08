package edu.cit.salindato.workforceportal.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class LeaveRequestPayload {
    private String subject;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String body;
}