package com.reservex.backend.dto;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationStall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReservationDto {
    private Integer id;
    private Integer userId;
    private String vendorName;
    private String vendorEmail;
    private String vendorPhone;
    private String businessName;
    private Integer exhibitionId;
    private String exhibitionName;
    private Instant reservationDate;
    private String status;
    private Integer noOfStalls;
    private List<String> stallNames;
    private List<String> businessCategories;
    private String specialRequirements;
    private String qrCodeToken;

    public static AdminReservationDto fromEntity(Reservation reservation) {
        List<String> stallNames = reservation.getReservationStalls().stream()
                .map(rs -> rs.getStall().getName())
                .collect(Collectors.toList());

        List<String> businessCategories = reservation.getReservationStalls().stream()
                .map(ReservationStall::getBusinessCategory)
                .filter(category -> category != null && !category.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        return AdminReservationDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUser() != null ? reservation.getUser().getId() : null)
                .vendorName(reservation.getUser() != null ? reservation.getUser().getName() : null)
                .vendorEmail(reservation.getUser() != null ? reservation.getUser().getEmail() : null)
                .vendorPhone(reservation.getUser() != null ? reservation.getUser().getContactNumber() : null)
                .businessName(reservation.getUser() != null ? reservation.getUser().getBusinessName() : null)
                .exhibitionId(reservation.getExhibition() != null ? reservation.getExhibition().getId() : null)
                .exhibitionName(reservation.getExhibition() != null ? reservation.getExhibition().getName() : null)
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus().name())
                .noOfStalls(reservation.getNoOfStallsRequired())
                .stallNames(stallNames)
                .businessCategories(businessCategories)
                .specialRequirements(reservation.getSpecialRequirements())
                .qrCodeToken(reservation.getQrCodeToken())
                .build();
    }
}
