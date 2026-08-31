package com.reservex.backend.dto;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationGenre;
import com.reservex.backend.entity.ReservationStall;
import com.reservex.backend.entity.Stall;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ReservationDto {

        private Integer id;
        private String qrCodeToken;
        private Instant reservationDate;
        private String status;
        private String specialRequirements;  // Special requirements for the reservation
        private List<ReservationStallDto> stalls;
        
        @JsonProperty("businessName")
        private String businessName;
        
        // Exhibition details
        private Integer exhibitionId;
        private String exhibitionName;
        private String exhibitionDescription;
        private String exhibitionVenue;
        private String exhibitionCity;
        private String exhibitionStartDate;
        private String exhibitionEndDate;

        public static ReservationDto fromEntity(Reservation r) {
                List<ReservationGenre> reservationGenres = r.getReservationGenres() != null
                                ? new java.util.ArrayList<>(r.getReservationGenres())
                                : List.of();

                List<ReservationStallDto> stallDtos = r.getStalls().stream()
                                .map(s -> toStallDto(s, r.getReservationStalls(), reservationGenres))
                                .collect(Collectors.toList());

                return ReservationDto.builder()
                                .id(r.getId())
                                .qrCodeToken(r.getQrCodeToken() != null ? r.getQrCodeToken() : r.getQrCodePath())
                                .reservationDate(r.getReservationDate())
                                .status(r.getStatus().name())
                                .specialRequirements(r.getSpecialRequirements())
                                .businessName(r.getUser() != null ? r.getUser().getBusinessName() : null)
                                .stalls(stallDtos)
                                .exhibitionId(r.getExhibition() != null ? r.getExhibition().getId() : null)
                                .exhibitionName(r.getExhibition() != null ? r.getExhibition().getName() : null)
                                .exhibitionDescription(r.getExhibition() != null ? r.getExhibition().getDescription() : null)
                                .exhibitionVenue(r.getExhibition() != null && r.getExhibition().getVenue() != null ? r.getExhibition().getVenue().getName() : null)
                                .exhibitionCity(r.getExhibition() != null && r.getExhibition().getVenue() != null ? r.getExhibition().getVenue().getCity() : null)
                                .exhibitionStartDate(r.getExhibition() != null ? r.getExhibition().getStartDate().toString() : null)
                                .exhibitionEndDate(r.getExhibition() != null ? r.getExhibition().getEndDate().toString() : null)
                                .build();
        }

        private static ReservationStallDto toStallDto(Stall s, java.util.Set<ReservationStall> reservationStalls, List<ReservationGenre> genres) {
                List<String> stallGenres = genres.stream()
                                .filter(g -> g.getStallId() != null && g.getStallId().equals(s.getId()))
                                .map(ReservationGenre::getGenreName)
                                .collect(Collectors.toList());

                // Find the ReservationStall to get business category and reserved price
                ReservationStall rs = reservationStalls.stream()
                                .filter(resStall -> resStall.getStall().getId().equals(s.getId()))
                                .findFirst()
                                .orElse(null);

                return ReservationStallDto.builder()
                                .id(s.getId())
                                .name(s.getName())
                                .size(s.getSize().name())
                                .type(s.getType())
                                .businessCategory(rs != null ? rs.getBusinessCategory() : null)
                                .price(rs != null ? rs.getReservedPrice().doubleValue() : s.getPrice())
                                .description(s.getDescription())
                                .gridRow(s.getGridRow())
                                .gridCol(s.getGridCol())
                                .genres(stallGenres)
                                .build();
        }
}
