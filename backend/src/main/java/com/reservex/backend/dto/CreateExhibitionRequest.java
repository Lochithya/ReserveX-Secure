package com.reservex.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExhibitionRequest {
    
    @NotNull(message = "Venue ID is required")
    private Integer venueId;
    
    @NotBlank(message = "Exhibition name is required")
    @Size(min = 3, max = 255, message = "Name must be between 3 and 255 characters")
    private String name;
    
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;
    
    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotNull(message = "Status is required")
    private String status; // DRAFT, PUBLISHED, CLOSED, CANCELLED
    
    @NotNull(message = "Maximum stalls per vendor is required")
    @Min(value = 1, message = "Maximum stalls per vendor must be at least 1")
    @Max(value = 10, message = "Maximum stalls per vendor cannot exceed 10")
    private Integer maxStallsPerVendor;
}
