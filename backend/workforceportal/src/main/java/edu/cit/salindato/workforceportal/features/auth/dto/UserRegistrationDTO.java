package edu.cit.salindato.workforceportal.features.auth.dto;

import lombok.Data;

@Data
public class UserRegistrationDTO {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String role;
}
