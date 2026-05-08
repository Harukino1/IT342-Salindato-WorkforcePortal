package edu.cit.salindato.workforceportal.features.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
