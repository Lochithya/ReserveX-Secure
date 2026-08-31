package com.reservex.backend.dto;

import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Venue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminExhibitionDto {
    private Integer id;
    private Integer venueId;
    private String venueName;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer maxStallsPerVendor;
    private long totalStalls;
    private long reservedStalls;
    private long availableStalls;

    public static AdminExhibitionDto fromEntity(Exhibition exhibition, long totalStalls, long reservedStalls) {
        Venue venue = exhibition.getVenue();
        return AdminExhibitionDto.builder()
                .id(exhibition.getId())
                .venueId(venue.getId())
                .venueName(venue.getName())
                .name(exhibition.getName())
                .description(exhibition.getDescription())
                .startDate(exhibition.getStartDate())
                .endDate(exhibition.getEndDate())
                .status(exhibition.getStatus().name())
                .maxStallsPerVendor(exhibition.getMaxStallsPerVendor())
                .totalStalls(totalStalls)
                .reservedStalls(reservedStalls)
                .availableStalls(totalStalls - reservedStalls)
                .build();
    }
}
