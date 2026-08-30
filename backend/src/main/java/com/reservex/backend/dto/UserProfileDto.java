package com.reservex.backend.dto;

import com.reservex.backend.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserProfileDto {
    private Integer id;
    private String name;
    private String businessName;
    private String email;
    private String username;
    private String contactNumber;
    private String role;
    private Integer noOfCurrentBookings;
    private Boolean hasPassword;
    private Instant createdAt;
    private Instant lastUpdatedAt;

    public static UserProfileDto fromEntity(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .businessName(user.getBusinessName())
                .email(user.getEmail())
                .username(user.getUsername())
                .contactNumber(user.getContactNumber())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .noOfCurrentBookings(user.getNoOfCurrentBookings())
                .hasPassword(user.getPassword() != null && !user.getPassword().isBlank())
                .createdAt(user.getCreatedAt())
                .lastUpdatedAt(user.getLastUpdatedAt())
                .build();
    }
}

