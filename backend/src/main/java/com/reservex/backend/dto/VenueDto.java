package com.reservex.backend.dto;

import com.reservex.backend.entity.Venue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueDto {
    private Integer id;
    private String name;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String country;
    private String postalCode;
    private String timezone;

    public static VenueDto fromEntity(Venue venue) {
        return VenueDto.builder()
                .id(venue.getId())
                .name(venue.getName())
                .addressLine1(venue.getAddressLine1())
                .addressLine2(venue.getAddressLine2())
                .city(venue.getCity())
                .country(venue.getCountry())
                .postalCode(venue.getPostalCode())
                .timezone(venue.getTimezone())
                .build();
    }
}
