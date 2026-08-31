// “max 3 stalls” rule
// create reservation + link stalls
//cancel reservation

package com.reservex.backend.services;

import com.reservex.backend.dto.ReservationDto;
import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationGenre;
import com.reservex.backend.entity.ReservationStall;
import com.reservex.backend.entity.Stall;
import com.reservex.backend.entity.User;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.StallRepository;
import com.reservex.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final int MAX_STALLS_PER_USER = 3;

    private final ReservationRepository reservationRepository;
    private final StallRepository stallRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final com.reservex.backend.repositories.ReservationGenreRepository genreRepository;

    /**
     * Convenience method for reserving a single stall.
     */
    @Transactional
    public ReservationDto createReservation(Integer userId, Integer stallId) {
        List<ReservationDto> reservations = createReservations(userId, List.of(stallId), null, null, null);
        return reservations.isEmpty() ? null : reservations.get(0);
    }

    /**
     * Create one reservation that may contain multiple stalls with business categories.
     */
    @Transactional
    public List<ReservationDto> createReservations(
            Integer userId,
            List<Integer> stallIds,
            Map<Integer, String> stallBusinessCategories,  // stallId -> businessCategory
            String specialRequirements,
            Integer exhibitionId) {
        if (stallIds == null || stallIds.isEmpty()) {
            throw new IllegalArgumentException("At least one stall is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Filter and load stalls that are not already reserved
        var stallsToBook = new HashSet<Stall>();
        for (Integer stallId : stallIds) {
            if (stallId == null)
                continue;
            if (reservationRepository.existsByStalls_Id(stallId)) {
                continue; // already reserved, skip
            }
            stallRepository.findById(stallId).ifPresent(stallsToBook::add);
        }

        if (stallsToBook.isEmpty()) {
            throw new IllegalArgumentException("All selected stalls are already reserved or invalid");
        }

        // A reservation may only contain stalls from one exhibition. The selected
        // exhibition route enforces this in the UI; this validates it server-side.
        var exhibitionIds = stallsToBook.stream()
                .map(Stall::getExhibition)
                .filter(java.util.Objects::nonNull)
                .map(exhibition -> exhibition.getId())
                .collect(Collectors.toSet());
        if (exhibitionIds.size() > 1) {
            throw new IllegalArgumentException("All selected stalls must belong to the same exhibition");
        }

        int currentBookings = user.getNoOfCurrentBookings();
        int newBookings = stallsToBook.size();
        if (currentBookings + newBookings > MAX_STALLS_PER_USER) {
            throw new IllegalArgumentException("Maximum 3 stalls per business allowed. " +
                    "You already have " + currentBookings + " booked.");
        }

        // Get the exhibition from first stall
        Exhibition exhibition = stallsToBook.iterator().next().getExhibition();

        // Create reservation
        Reservation reservation = Reservation.builder()
                .user(user)
                .exhibition(exhibition)
                .status(Reservation.Status.APPROVED)
                .specialRequirements(specialRequirements)  // User's special requirements
                .noOfStallsRequired(newBookings)
                .build();

        // Save reservation first to get the ID
        reservation = reservationRepository.save(reservation);

        // Create ReservationStall entries for each stall
        for (Stall stall : stallsToBook) {
            // Get business category for this specific stall
            String businessCategory = stallBusinessCategories != null && stallBusinessCategories.containsKey(stall.getId())
                    ? stallBusinessCategories.get(stall.getId())
                    : "General";  // Default if not provided
            
            ReservationStall reservationStall = ReservationStall.builder()
                    .reservation(reservation)
                    .stall(stall)
                    .exhibition(exhibition)
                    .reservedPrice(java.math.BigDecimal.valueOf(stall.getPrice() != null ? stall.getPrice() : 0.0))
                    .businessCategory(businessCategory)  // Set business category per stall
                    .allocationStatus(ReservationStall.AllocationStatus.HELD)
                    .build();
            
            reservation.getReservationStalls().add(reservationStall);
            
            // Mark stall as confirmed
            stall.setIsConfirmed(true);
            stallRepository.save(stall);
        }

        // Save reservation with reservation_stalls
        reservation = reservationRepository.save(reservation);

        // Update cached count on user
        user.setNoOfCurrentBookings(currentBookings + newBookings);
        userRepository.save(user);

        // Flush to ensure all data is persisted before sending email
        reservationRepository.flush();
        stallRepository.flush();
        
        // Prepare final variables for async execution
        final Reservation finalReservation = reservation;
        final User finalUser = user;
        
        // Send email ASYNCHRONOUSLY - don't block the HTTP response
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                emailService.sendReservationConfirmation(finalUser, finalReservation);
                System.out.println("✅ Reservation confirmation email sent successfully to: " + finalUser.getEmail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send reservation confirmation email: " + e.getMessage());
                e.printStackTrace();
            }
        });

        List<ReservationDto> result = new ArrayList<>();
        result.add(ReservationDto.fromEntity(reservation));
        return result;
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getMyReservations(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return reservationRepository.findByUserWithDetailsOrderByReservationDateDesc(user).stream()
                .map(ReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAllWithDetails().stream()
                .map(ReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateStallDetails(Integer userId, Integer reservationId, Integer stallId, String businessCategory, List<String> genres) {
        // Verify user owns this reservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        
        if (!reservation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to modify this reservation");
        }
        
        // Find and update the ReservationStall
        ReservationStall reservationStall = reservation.getReservationStalls().stream()
                .filter(rs -> rs.getStall().getId().equals(stallId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Stall not found in this reservation"));
        
        // Update business category
        if (businessCategory != null) {
            reservationStall.setBusinessCategory(businessCategory);
        }
        
        // Delete existing genres for this stall using query
        genreRepository.deleteByReservationIdAndStallId(reservationId, stallId);
        
        // Flush to ensure deletes are executed
        genreRepository.flush();
        
        // Add new genres
        for (String genreName : genres) {
            ReservationGenre rg = ReservationGenre.builder()
                    .reservation(reservation)
                    .stallId(stallId)
                    .genreName(genreName)
                    .reservationStallId(reservationStall.getId())  // Set the reservation_stall_id
                    .build();
            genreRepository.save(rg);
        }
        
        // Save the reservation (will update the business category)
        reservationRepository.save(reservation);
    }
}