package com.reservex.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStallRequest {
    
    @NotNull(message = "Exhibition ID is required")
    private Integer exhibitionId;
    
    @NotBlank(message = "Stall name is required")
    @Size(min = 1, max = 50, message = "Stall name must be between 1 and 50 characters")
    private String name;
    
    @NotBlank(message = "Size is required")
    @Pattern(regexp = "small|medium|large", message = "Size must be: small, medium, or large")
    private String size;
    
    @NotBlank(message = "Type is required")
    @Size(max = 100, message = "Type cannot exceed 100 characters")
    private String type; // e.g., "Standard", "Premium", "Corner Stall"
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double price;
    
    @NotNull(message = "Grid row is required")
    @Min(value = 1, message = "Grid row must be at least 1")
    private Integer gridRow;
    
    @NotNull(message = "Grid column is required")
    @Min(value = 1, message = "Grid column must be at least 1")
    private Integer gridCol;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    private Boolean isActive = true;
}
