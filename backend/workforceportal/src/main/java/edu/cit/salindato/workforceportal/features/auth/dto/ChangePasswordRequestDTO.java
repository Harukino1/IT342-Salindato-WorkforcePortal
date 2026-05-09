package edu.cit.salindato.workforceportal.features.auth.dto;

import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    private String oldPassword;
    private String newPassword;
}

