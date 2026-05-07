package edu.cit.salindato.workforceportal.features.auth.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.cit.salindato.workforceportal.features.auth.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByToken(String token);
}
