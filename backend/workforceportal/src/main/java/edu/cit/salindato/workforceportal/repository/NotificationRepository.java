package edu.cit.salindato.workforceportal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
}
