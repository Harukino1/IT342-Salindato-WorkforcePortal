package edu.cit.salindato.workforceportal.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.LeaveRequest;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByUserId(String userId);
}
