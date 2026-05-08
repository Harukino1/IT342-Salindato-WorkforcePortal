package edu.cit.salindato.workforceportal.features.notification.repository;

import edu.cit.salindato.workforceportal.features.notification.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
}
