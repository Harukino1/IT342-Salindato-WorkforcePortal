package edu.cit.salindato.workforceportal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "announcements")
public class Announcement {
	@Id
	private String id;

	// One user (admin) can create many announcements.
	@Indexed
	@Field("admin_id")
	private String adminId;

	private String content;

	@Field("created_at")
	private LocalDateTime createdAt;
}
