package edu.cit.salindato.workforceportal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
public class Attendance {
	@Id
	private String id;

	private LocalDate date;

	@Field("clock_in")
	private LocalDateTime clockIn;

	@Field("clock_out")
	private LocalDateTime clockOut;

	@Field("break_duration")
	private Integer breakDuration;

	@Field("total_hours")
	private BigDecimal totalHours;

	private String status;

	// One user can have many attendance records.
	@Indexed
	@Field("user_id")
	private String userId;
}