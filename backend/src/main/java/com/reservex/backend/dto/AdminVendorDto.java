package com.reservex.backend.dto;

import com.reservex.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminVendorDto {
    private Integer id;
    private String name;
    private String email;
    private String username;
    private String contactNumber;
    private String businessName;
    private Integer noOfCurrentBookings;
    private String role;
    private Instant createdAt;
    private Instant lastUpdatedAt;
    private Integer totalReservations;

    public static AdminVendorDto fromEntity(User user, Integer totalReservations) {
        return AdminVendorDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .contactNumber(user.getContactNumber())
                .businessName(user.getBusinessName())
                .noOfCurrentBookings(user.getNoOfCurrentBookings())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdAt(user.getCreatedAt())
                .lastUpdatedAt(user.getLastUpdatedAt())
                .totalReservations(totalReservations)
                .build();
    }
}
