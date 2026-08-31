package com.reservex.backend.services;

import com.reservex.backend.dto.*;
import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Venue;
import com.reservex.backend.repositories.ExhibitionRepository;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.StallRepository;
import com.reservex.backend.repositories.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminExhibitionService {
    
    private final ExhibitionRepository exhibitionRepository;
    private final VenueRepository venueRepository;
    private final StallRepository stallRepository;
    private final ReservationRepository reservationRepository;

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

        // Update exhibition
        exhibition.setVenue(venue);
        exhibition.setName(request.getName());
        exhibition.setDescription(request.getDescription());
        exhibition.setStartDate(request.getStartDate());
        exhibition.setEndDate(request.getEndDate());
        exhibition.setStatus(status);
        exhibition.setMaxStallsPerVendor(request.getMaxStallsPerVendor());

        Exhibition updated = exhibitionRepository.save(exhibition);
        return toAdminDto(updated);
    }

    @Transactional
    public void deleteExhibition(Integer id) {
        Exhibition exhibition = exhibitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + id));

        // Check if exhibition has reservations
        long reservationCount = reservationRepository.countByExhibitionId(id);
        if (reservationCount > 0) {
            throw new IllegalStateException("Cannot delete exhibition with existing reservations. Please cancel all reservations first.");
        }

        // Check if exhibition has stalls
        long stallCount = stallRepository.countByExhibitionId(id);
        if (stallCount > 0) {
            throw new IllegalStateException("Cannot delete exhibition with existing stalls. Please delete all stalls first.");
        }

        exhibitionRepository.delete(exhibition);
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
