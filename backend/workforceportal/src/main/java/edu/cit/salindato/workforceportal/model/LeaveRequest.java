package edu.cit.salindato.workforceportal.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leave_requests")
public class LeaveRequest {
	@Id
	private String id;

	private String subject;

	@Field("leave_type")
	private String leaveType;

	@Field("start_date")
	private LocalDate startDate;

	@Field("end_date")
	private LocalDate endDate;

	@Field("total_days")
	private Integer totalDays;

	private String body; // Maps to what the user inputted

	private String status;

	@Field("created_at")
	private LocalDateTime createdAt;

	// One user can have many leave requests.
	@Indexed
	@Field("user_id")
	private String userId;
}
