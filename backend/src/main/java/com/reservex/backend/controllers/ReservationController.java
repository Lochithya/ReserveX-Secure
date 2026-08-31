// Reserve stall(s) endpoint
// “My reservations” endpoint


package com.reservex.backend.controllers;

import com.reservex.backend.config.UserPrincipal;
import com.reservex.backend.dto.ReservationDto;
import com.reservex.backend.services.ReservationGenreService;
import com.reservex.backend.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationGenreService genreService;
    @PostMapping
    public ResponseEntity<?> createReservation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        try {
            // Extract stall IDs
            if (body.get("stallIds") != null || body.get("stall_ids") != null) {
                @SuppressWarnings("unchecked")
                List<?> rawList = (List<?>) (body.get("stall_ids") != null ? body.get("stall_ids") : body.get("stallIds"));
                List<Integer> stallIds = rawList.stream()
                        .map(id -> id instanceof Number n ? n.intValue() : Integer.parseInt(id.toString()))
                        .toList();
                
                // Extract exhibition_id
                Integer exhibitionId = body.get("exhibition_id") != null 
                    ? (body.get("exhibition_id") instanceof Number n ? n.intValue() : Integer.parseInt(body.get("exhibition_id").toString()))
                    : null;
                
                // Extract special_requirements
                String specialRequirements = body.get("special_requirements") != null 
                    ? body.get("special_requirements").toString() 
                    : null;
                
                // Extract stall_business_categories (map of stallId -> category)
                Map<Integer, String> stallBusinessCategories = null;
                if (body.get("stall_business_categories") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, String> rawMap = (Map<String, String>) body.get("stall_business_categories");
                    stallBusinessCategories = new java.util.HashMap<>();
                    for (Map.Entry<String, String> entry : rawMap.entrySet()) {
                        stallBusinessCategories.put(Integer.parseInt(entry.getKey()), entry.getValue());
                    }
                }
                
                List<ReservationDto> dtos = reservationService.createReservations(
                    principal.getId(), 
                    stallIds, 
                    stallBusinessCategories,
                    specialRequirements,
                    exhibitionId
                );
                
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Reservation confirmed! QR code sent to your email.",
                    "reservations", dtos
                ));
            }
            
            // Single stall reservation
            Object stallIdObj = body.get("stallId");
            if (stallIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "stallId or stallIds is required"));
            }
            Integer stallId = stallIdObj instanceof Number n ? n.intValue() : Integer.parseInt(stallIdObj.toString());
            ReservationDto dto = reservationService.createReservation(principal.getId(), stallId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Reservation confirmed! QR code sent to your email.",
                "reservation", dto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationDto>> getMyReservations(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reservationService.getMyReservations(principal.getId()));
    }

}
