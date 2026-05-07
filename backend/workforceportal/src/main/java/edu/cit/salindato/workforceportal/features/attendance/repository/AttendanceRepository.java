package edu.cit.salindato.workforceportal.features.attendance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.features.attendance.model.Attendance;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    Optional<Attendance> findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(String userId);
    List<Attendance> findTop10ByUserIdOrderByClockInDesc(String userId);
}
