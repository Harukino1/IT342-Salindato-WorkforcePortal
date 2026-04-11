package edu.cit.salindato.workforceportal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.Attendance;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
}
