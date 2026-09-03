package com.reservex.backend.services;

import com.reservex.backend.dto.*;
import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.Stall;
import com.reservex.backend.entity.User;
import com.reservex.backend.entity.Venue;
import com.reservex.backend.repositories.ExhibitionRepository;
import com.reservex.backend.repositories.ReservationGenreRepository;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.StallRepository;
import com.reservex.backend.repositories.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminExhibitionService {
    
    private final ExhibitionRepository exhibitionRepository;
    private final VenueRepository venueRepository;
    private final StallRepository stallRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationGenreRepository reservationGenreRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<AdminExhibitionDto> getAllExhibitions() {
        return exhibitionRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminExhibitionDto getExhibitionById(Integer id) {
        Exhibition exhibition = exhibitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + id));
        return toAdminDto(exhibition);
    }

    @Transactional
    public AdminExhibitionDto createExhibition(CreateExhibitionRequest request) {
        // Validate venue exists
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + request.getVenueId()));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Validate status
        Exhibition.Status status;
        try {
            status = Exhibition.Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be one of: DRAFT, PUBLISHED, CLOSED, CANCELLED");
        }

        // Create exhibition
        Exhibition exhibition = new Exhibition();
        exhibition.setVenue(venue);
        exhibition.setName(request.getName());
        exhibition.setDescription(request.getDescription());
        exhibition.setStartDate(request.getStartDate());
        exhibition.setEndDate(request.getEndDate());
        exhibition.setStatus(status);
        exhibition.setMaxStallsPerVendor(request.getMaxStallsPerVendor());

        Exhibition saved = exhibitionRepository.save(exhibition);
        return toAdminDto(saved);
    }

    @Transactional
    public AdminExhibitionDto updateExhibition(Integer id, UpdateExhibitionRequest request) {
        Exhibition exhibition = exhibitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + id));

        // Store old status for comparison
        Exhibition.Status oldStatus = exhibition.getStatus();

        // Validate venue exists
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + request.getVenueId()));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Validate status
        Exhibition.Status newStatus;
        try {
            newStatus = Exhibition.Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be one of: DRAFT, PUBLISHED, CLOSED, CANCELLED");
        }

        // Handle status change to CANCELLED
        if (oldStatus != Exhibition.Status.CANCELLED && newStatus == Exhibition.Status.CANCELLED) {
            handleExhibitionCancellation(exhibition);
        }

        // Update exhibition
        exhibition.setVenue(venue);
        exhibition.setName(request.getName());
        exhibition.setDescription(request.getDescription());
        exhibition.setStartDate(request.getStartDate());
        exhibition.setEndDate(request.getEndDate());
        exhibition.setStatus(newStatus);
        exhibition.setMaxStallsPerVendor(request.getMaxStallsPerVendor());

        Exhibition updated = exhibitionRepository.save(exhibition);
        return toAdminDto(updated);
    }

    /**
     * Handles the cascading effects when an exhibition is cancelled:
     * 1. Releases all stalls (sets is_Confirmed = false)
     * 2. Deletes all ReservationGenre records for this exhibition
     * 3. Deletes all ReservationStall records  
     * 4. Deletes all Reservation records
     * 5. Decrements user booking counts
     * 6. Sends cancellation emails to all affected vendors
     */
    @Transactional
    protected void handleExhibitionCancellation(Exhibition exhibition) {
        System.out.println(">>> Handling cancellation for exhibition: " + exhibition.getName());
        
        // 1. Find all reservations for this exhibition
        List<Reservation> reservations = reservationRepository
                .findAllByExhibitionIdOrderByReservationDateDesc(exhibition.getId());
        
        if (reservations.isEmpty()) {
            System.out.println(">>> No reservations found for this exhibition. Skipping cancellation workflow.");
            return;
        }
        
        System.out.println(">>> Found " + reservations.size() + " reservation(s) to cancel");
        
        // Track affected users and their stall counts for email notifications
        Map<User, Integer> affectedUsers = new HashMap<>();
        
        // 2. Process each reservation
        for (Reservation reservation : reservations) {
            User user = reservation.getUser();
            int stallCount = reservation.getStalls().size();
            
            // Track user and stall count for email
            affectedUsers.merge(user, stallCount, Integer::sum);
            
            // 3. Delete ReservationGenre records for this reservation
            reservationGenreRepository.deleteAllByReservation_Id(reservation.getId());
            
            // 4. Update user booking count
            int currentBookings = user.getNoOfCurrentBookings();
            user.setNoOfCurrentBookings(Math.max(0, currentBookings - stallCount));
            
            System.out.println(">>> User " + user.getEmail() + " bookings: " + 
                              currentBookings + " -> " + user.getNoOfCurrentBookings());
        }
        
        // 5. Delete all reservations (cascade will delete ReservationStall records)
        reservationRepository.deleteAll(reservations);
        System.out.println(">>> Deleted all reservations and their stall allocations");
        
        // 6. Release all stalls in this exhibition (set isConfirmed = false)
        List<Stall> stalls = stallRepository.findAllByExhibitionIdOrderByNameAsc(exhibition.getId());
        for (Stall stall : stalls) {
            stall.setIsConfirmed(false);
        }
        stallRepository.saveAll(stalls);
        System.out.println(">>> Released " + stalls.size() + " stall(s) back to available status");
        
        // 7. Send cancellation emails to all affected users
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String startDate = exhibition.getStartDate().format(formatter);
        String endDate = exhibition.getEndDate().format(formatter);
        
        affectedUsers.forEach((user, stallCount) -> {
            emailService.sendExhibitionCancellationNotification(
                user, 
                exhibition.getName(), 
                startDate,
                endDate,
                stallCount
            );
        });
        
        System.out.println(">>> Sent cancellation emails to " + affectedUsers.size() + " vendor(s)");
        System.out.println(">>> Exhibition cancellation handling completed successfully");
    }

    @Transactional
    public void deleteExhibition(Integer id) {
        Exhibition exhibition = exhibitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + id));

        // SAFE DELETION STRATEGY:
        // If has active reservations -> MUST cancel first (to notify vendors)
        // If no reservations -> Can delete directly (any status)
        
        // Check if exhibition has active reservations
        long reservationCount = reservationRepository.countByExhibitionId(id);
        if (reservationCount > 0) {
            throw new IllegalStateException(
                "Cannot delete exhibition with active reservations. " +
                "Please change status to CANCELLED first to notify vendors and clean up reservations automatically."
            );
        }

        // No reservations - safe to delete
        // Check if exhibition has stalls and delete them automatically
        long stallCount = stallRepository.countByExhibitionId(id);
        if (stallCount > 0) {
            System.out.println(">>> Deleting " + stallCount + " stalls for exhibition: " + exhibition.getName());
            List<Stall> stalls = stallRepository.findAllByExhibitionIdOrderByNameAsc(id);
            stallRepository.deleteAll(stalls);
            System.out.println(">>> Stalls deleted successfully");
        }

        System.out.println(">>> Deleting exhibition: " + exhibition.getName());
        exhibitionRepository.delete(exhibition);
        System.out.println(">>> Exhibition deleted successfully");
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getAllVenues() {
        return venueRepository.findAllByOrderByNameAsc().stream()
                .map(VenueDto::fromEntity)
                .toList();
    }

    private AdminExhibitionDto toAdminDto(Exhibition exhibition) {
        long totalStalls = stallRepository.countByExhibitionId(exhibition.getId());
        long reservedStalls = stallRepository.countByExhibitionIdAndIsActiveTrueAndIsConfirmedTrue(exhibition.getId());
        return AdminExhibitionDto.fromEntity(exhibition, totalStalls, reservedStalls);
    }
}
