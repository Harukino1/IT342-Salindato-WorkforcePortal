package edu.cit.salindato.workforceportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
