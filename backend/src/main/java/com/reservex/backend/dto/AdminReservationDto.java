package com.reservex.backend.dto;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationGenre;
import com.reservex.backend.entity.ReservationStall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Collections;
import java.util.Set;
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
    private String venueName;
    private Instant reservationDate;
    private String status;
    private Integer noOfStalls;
    private List<String> stallNames;
    private List<String> businessCategories;
    private List<String> genres;
    private BigDecimal totalPrice;
    private List<StallPriceDetail> stallDetails;
    private String specialRequirements;
    private String qrCodeToken;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StallPriceDetail {
        private Integer stallId;
        private String stallName;
        private String stallType;
        private String stallSize;
        private BigDecimal price;
        private String businessCategory;
        private List<String> genres;
    }

    public static AdminReservationDto fromEntity(Reservation reservation) {
        List<String> stallNames = reservation.getReservationStalls().stream()
                .map(rs -> rs.getStall().getName())
                .collect(Collectors.toList());

        List<String> businessCategories = reservation.getReservationStalls().stream()
                .map(ReservationStall::getBusinessCategory)
                .filter(category -> category != null && !category.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        // Calculate total price from all reservation stalls
        BigDecimal totalPrice = reservation.getReservationStalls().stream()
                .map(ReservationStall::getReservedPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get all reservation genres for lookup
        Set<ReservationGenre> allGenres = reservation.getReservationGenres() != null
                ? reservation.getReservationGenres()
                : Collections.emptySet();

        // Build stall price details with per-stall genres
        List<StallPriceDetail> stallDetails = reservation.getReservationStalls().stream()
                .map(rs -> {
                    List<String> stallGenres = allGenres.stream()
                            .filter(g -> g.getStallId() != null && g.getStallId().equals(rs.getStall().getId()))
                            .map(ReservationGenre::getGenreName)
                            .filter(name -> name != null && !name.isEmpty())
                            .distinct()
                            .collect(Collectors.toList());
                    return StallPriceDetail.builder()
                            .stallId(rs.getStall().getId())
                            .stallName(rs.getStall().getName())
                            .stallType(rs.getStall().getType())
                            .stallSize(rs.getStall().getSize() != null ? rs.getStall().getSize().name() : null)
                            .price(rs.getReservedPrice())
                            .businessCategory(rs.getBusinessCategory())
                            .genres(stallGenres)
                            .build();
                })
                .collect(Collectors.toList());

        // Get genres (directly from genreName field)
        List<String> genres = reservation.getReservationGenres() != null
                ? reservation.getReservationGenres().stream()
                    .map(ReservationGenre::getGenreName)
                    .filter(name -> name != null && !name.isEmpty())
                    .distinct()
                    .collect(Collectors.toList())
                : Collections.emptyList();

        return AdminReservationDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUser() != null ? reservation.getUser().getId() : null)
                .vendorName(reservation.getUser() != null ? reservation.getUser().getName() : null)
                .vendorEmail(reservation.getUser() != null ? reservation.getUser().getEmail() : null)
                .vendorPhone(reservation.getUser() != null ? reservation.getUser().getContactNumber() : null)
                .businessName(reservation.getUser() != null ? reservation.getUser().getBusinessName() : null)
                .exhibitionId(reservation.getExhibition() != null ? reservation.getExhibition().getId() : null)
                .exhibitionName(reservation.getExhibition() != null ? reservation.getExhibition().getName() : null)
                .venueName(reservation.getExhibition() != null && reservation.getExhibition().getVenue() != null 
                        ? reservation.getExhibition().getVenue().getName() : null)
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus().name())
                .noOfStalls(reservation.getNoOfStallsRequired())
                .stallNames(stallNames)
                .businessCategories(businessCategories)
                .genres(genres)
                .totalPrice(totalPrice)
                .stallDetails(stallDetails)
                .specialRequirements(reservation.getSpecialRequirements())
                .qrCodeToken(reservation.getQrCodeToken())
                .build();
    }
}
