// Admin endpoints to view all stalls and reservations

package com.reservex.backend.controllers;

import com.reservex.backend.dto.*;
import com.reservex.backend.services.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StallService stallService;
    private final ReservationService reservationService;
    private final AdminExhibitionService adminExhibitionService;
    private final AdminStallService adminStallService;
    private final AdminReservationService adminReservationService;
    private final AdminVendorService adminVendorService;
    private final AdminDashboardService adminDashboardService;

    @PreAuthorize("hasRole('EMPLOYEE')") // Only allow users with EMPLOYEE role (admin) to access these endpoints
    @GetMapping("/stalls")
    public ResponseEntity<List<StallDto>> getAllStalls() {
        return ResponseEntity.ok(stallService.getAllStallsWithAvailability());
    }

    @PreAuthorize("hasRole('EMPLOYEE')") // Only allow users with EMPLOYEE role (admin) to access these endpoints
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // ============ Dashboard Endpoints ============

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    // ============ Exhibition Management Endpoints ============

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/exhibitions")
    public ResponseEntity<List<AdminExhibitionDto>> getAllExhibitions() {
        return ResponseEntity.ok(adminExhibitionService.getAllExhibitions());
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/exhibitions/{id}")
    public ResponseEntity<AdminExhibitionDto> getExhibitionById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminExhibitionService.getExhibitionById(id));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping("/exhibitions")
    public ResponseEntity<AdminExhibitionDto> createExhibition(@Valid @RequestBody CreateExhibitionRequest request) {
        AdminExhibitionDto created = adminExhibitionService.createExhibition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PutMapping("/exhibitions/{id}")
    public ResponseEntity<AdminExhibitionDto> updateExhibition(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateExhibitionRequest request) {
        AdminExhibitionDto updated = adminExhibitionService.updateExhibition(id, request);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @DeleteMapping("/exhibitions/{id}")
    public ResponseEntity<Map<String, String>> deleteExhibition(@PathVariable Integer id) {
        adminExhibitionService.deleteExhibition(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Exhibition deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/venues")
    public ResponseEntity<List<VenueDto>> getAllVenues() {
        return ResponseEntity.ok(adminExhibitionService.getAllVenues());
    }

    // ============ Stall Management Endpoints ============

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/stalls/all")
    public ResponseEntity<List<AdminStallDto>> getAllStallsAdmin() {
        return ResponseEntity.ok(adminStallService.getAllStalls());
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/stalls/exhibition/{exhibitionId}")
    public ResponseEntity<List<AdminStallDto>> getStallsByExhibition(@PathVariable Integer exhibitionId) {
        return ResponseEntity.ok(adminStallService.getStallsByExhibition(exhibitionId));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/stalls/{id}")
    public ResponseEntity<AdminStallDto> getStallById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminStallService.getStallById(id));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping("/stalls")
    public ResponseEntity<AdminStallDto> createStall(@Valid @RequestBody CreateStallRequest request) {
        AdminStallDto created = adminStallService.createStall(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PutMapping("/stalls/{id}")
    public ResponseEntity<AdminStallDto> updateStall(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStallRequest request) {
        AdminStallDto updated = adminStallService.updateStall(id, request);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @DeleteMapping("/stalls/{id}")
    public ResponseEntity<Map<String, String>> deleteStall(@PathVariable Integer id) {
        adminStallService.deleteStall(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Stall deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ============ Reservation Management Endpoints ============

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/reservations/all")
    public ResponseEntity<List<AdminReservationDto>> getAllReservationsAdmin() {
        return ResponseEntity.ok(adminReservationService.getAllReservations());
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/reservations/exhibition/{exhibitionId}")
    public ResponseEntity<List<AdminReservationDto>> getReservationsByExhibition(@PathVariable Integer exhibitionId) {
        return ResponseEntity.ok(adminReservationService.getReservationsByExhibition(exhibitionId));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/reservations/{id}")
    public ResponseEntity<AdminReservationDto> getReservationById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminReservationService.getReservationById(id));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PatchMapping("/reservations/{id}/status")
    public ResponseEntity<AdminReservationDto> updateReservationStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        AdminReservationDto updated = adminReservationService.updateReservationStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Map<String, String>> deleteReservation(@PathVariable Integer id) {
        adminReservationService.deleteReservation(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Reservation deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ============ Vendor Management Endpoints ============

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/vendors")
    public ResponseEntity<List<AdminVendorDto>> getAllVendors() {
        return ResponseEntity.ok(adminVendorService.getAllVendors());
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/vendors/{id}")
    public ResponseEntity<AdminVendorDto> getVendorById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminVendorService.getVendorById(id));
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/vendors/{id}/reservations")
    public ResponseEntity<List<AdminReservationDto>> getVendorReservations(@PathVariable Integer id) {
        return ResponseEntity.ok(adminVendorService.getVendorReservations(id));
    }
}
