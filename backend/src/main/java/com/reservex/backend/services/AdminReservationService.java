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
    private final EmailService emailService;

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

        // Store old status for email notification
        String oldStatus = reservation.getStatus().name();

        // Validate status
        Reservation.Status newStatus;
        try {
            newStatus = Reservation.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be one of: PENDING, APPROVED, REJECTED");
        }

        reservation.setStatus(newStatus);
        Reservation updated = reservationRepository.save(reservation);
        
        // Send email notification if status actually changed
        if (!oldStatus.equals(newStatus.name()) && updated.getUser() != null) {
            try {
                emailService.sendReservationStatusChangeNotification(
                    updated.getUser(), updated, oldStatus, newStatus.name());
            } catch (Exception e) {
                // Log error but don't fail the transaction
                System.err.println("Failed to send status change email: " + e.getMessage());
            }
        }
        
        return AdminReservationDto.fromEntity(updated);
    }

    @Transactional
    public void deleteReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        // Collect information for email notification before deleting
        String exhibitionName = reservation.getExhibition() != null 
            ? reservation.getExhibition().getName() 
            : "Exhibition";
        List<String> stallNames = reservation.getStalls().stream()
            .map(stall -> stall.getName())
            .collect(Collectors.toList());

        // Mark stalls as available again by setting isConfirmed to false
        reservation.getStalls().forEach(stall -> stall.setIsConfirmed(false));
        
        // Update user's booking count
        int remainingBookings = 0;
        if (reservation.getUser() != null) {
            int currentBookings = reservation.getUser().getNoOfCurrentBookings();
            int stallCount = reservation.getNoOfStallsRequired();
            remainingBookings = Math.max(0, currentBookings - stallCount);
            reservation.getUser().setNoOfCurrentBookings(remainingBookings);
        }

        // Send email notification before deleting
        if (reservation.getUser() != null) {
            try {
                emailService.sendReservationDeletionNotification(
                    reservation.getUser(), exhibitionName, stallNames, remainingBookings);
            } catch (Exception e) {
                // Log error but don't fail the transaction
                System.err.println("Failed to send deletion email: " + e.getMessage());
            }
        }

        reservationRepository.delete(reservation);
    }
}
