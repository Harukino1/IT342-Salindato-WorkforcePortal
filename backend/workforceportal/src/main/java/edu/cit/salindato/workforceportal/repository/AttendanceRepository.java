package edu.cit.salindato.workforceportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.Attendance;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
	Optional<Attendance> findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(String userId);
	List<Attendance> findTop10ByUserIdOrderByClockInDesc(String userId);
}
