package com.reservex.backend.services;

import com.reservex.backend.dto.AdminReservationDto;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReservationService {
    
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<AdminReservationDto> getAllReservations() {
        return reservationRepository.findAllWithDetails().stream()
                .map(AdminReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminReservationDto> getReservationsByExhibition(Integer exhibitionId) {
        return reservationRepository.findAllByExhibitionIdOrderByReservationDateDesc(exhibitionId).stream()
                .map(AdminReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminReservationDto getReservationById(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));
        return AdminReservationDto.fromEntity(reservation);
    }

    @Transactional
    public AdminReservationDto updateReservationStatus(Integer id, String status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        // Validate status
        Reservation.Status newStatus;
        try {
            newStatus = Reservation.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be one of: PENDING, APPROVED, REJECTED");
        }

        reservation.setStatus(newStatus);
        Reservation updated = reservationRepository.save(reservation);
        return AdminReservationDto.fromEntity(updated);
    }

    @Transactional
    public void deleteReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        // Mark stalls as available again by setting isConfirmed to false
        reservation.getStalls().forEach(stall -> stall.setIsConfirmed(false));
        
        // Update user's booking count
        if (reservation.getUser() != null) {
            int currentBookings = reservation.getUser().getNoOfCurrentBookings();
            int stallCount = reservation.getNoOfStallsRequired();
            reservation.getUser().setNoOfCurrentBookings(Math.max(0, currentBookings - stallCount));
        }

        reservationRepository.delete(reservation);
    }
}
