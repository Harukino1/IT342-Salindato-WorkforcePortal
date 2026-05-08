package edu.cit.salindato.workforceportal.features.announcement.repository;

import edu.cit.salindato.workforceportal.features.announcement.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {

}
