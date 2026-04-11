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
@Document(collection = "notifications")
public class Notification {
	@Id
	private String id;

	// One user can have many notifications.
	@Indexed
	@Field("user_id")
	private String userId;

	private String title;

	private String message;

	private String type;

	@Field("is_read")
	private Boolean isRead;

	@Field("created_at")
	private LocalDateTime createdAt;
}
