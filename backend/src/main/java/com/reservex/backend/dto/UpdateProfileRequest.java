package com.reservex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Full name cannot be empty")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username can only contain letters, numbers, underscores, dashes, and periods")
    private String username;

    @NotBlank(message = "Business name cannot be empty")
    @Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    private String businessName;

    private String contactNumber;
}
