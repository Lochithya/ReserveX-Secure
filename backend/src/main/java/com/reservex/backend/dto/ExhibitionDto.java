package com.reservex.backend.dto;

import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Venue;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ExhibitionDto {
    private Integer id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer maxStallsPerVendor;
    private VenueDto venue;
    private long totalStalls;
    private long availableStalls;

    @Data
    @Builder
    public static class VenueDto {
        private Integer id;
        private String name;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String country;
        private String postalCode;
    }

    public static ExhibitionDto fromEntity(Exhibition exhibition, long totalStalls, long availableStalls) {
        Venue venue = exhibition.getVenue();
        return ExhibitionDto.builder()
                .id(exhibition.getId()).name(exhibition.getName()).description(exhibition.getDescription())
                .startDate(exhibition.getStartDate()).endDate(exhibition.getEndDate())
                .status(exhibition.getStatus().name()).maxStallsPerVendor(exhibition.getMaxStallsPerVendor())
                .totalStalls(totalStalls).availableStalls(availableStalls)
                .venue(VenueDto.builder().id(venue.getId()).name(venue.getName())
                        .addressLine1(venue.getAddressLine1()).addressLine2(venue.getAddressLine2())
                        .city(venue.getCity()).country(venue.getCountry()).postalCode(venue.getPostalCode()).build())
                .build();
    }
}
