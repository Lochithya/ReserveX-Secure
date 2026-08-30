package com.reservex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String contactNumber;
    private String role;
    private String businessName;
    private Integer noOfCurrentBookings;
}
