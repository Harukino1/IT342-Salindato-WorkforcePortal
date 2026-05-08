package edu.cit.salindato.workforceportal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.model.LeaveRequest;

public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
}
