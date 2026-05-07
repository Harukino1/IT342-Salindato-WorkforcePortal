package edu.cit.salindato.workforceportal.features.leave.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.features.leave.model.LeaveRequest;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUserId(String userId);
}
