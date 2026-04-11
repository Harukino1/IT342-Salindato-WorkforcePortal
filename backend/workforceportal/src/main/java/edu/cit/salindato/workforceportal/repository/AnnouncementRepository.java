package edu.cit.salindato.workforceportal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.Announcement;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
}
