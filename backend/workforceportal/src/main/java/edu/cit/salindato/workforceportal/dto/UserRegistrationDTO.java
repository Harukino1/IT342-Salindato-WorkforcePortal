package edu.cit.salindato.workforceportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String role;
}
