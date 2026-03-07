package edu.cit.salindato.workforceportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class WorkforceportalApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkforceportalApplication.class, args);
	}

}
