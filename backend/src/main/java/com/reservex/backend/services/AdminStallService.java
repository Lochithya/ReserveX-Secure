package com.reservex.backend.services;

import com.reservex.backend.dto.AdminStallDto;
import com.reservex.backend.dto.CreateStallRequest;
import com.reservex.backend.dto.UpdateStallRequest;
import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.Stall;
import com.reservex.backend.repositories.ExhibitionRepository;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStallService {
    
    private final StallRepository stallRepository;
    private final ExhibitionRepository exhibitionRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<AdminStallDto> getAllStalls() {
        return stallRepository.findAll().stream()
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminStallDto> getStallsByExhibition(Integer exhibitionId) {
        Exhibition exhibition = exhibitionRepository.findById(exhibitionId)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + exhibitionId));
        
        return stallRepository.findAllByExhibitionIdOrderByNameAsc(exhibitionId).stream()
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminStallDto getStallById(Integer id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found with ID: " + id));
        return toAdminDto(stall);
    }

    @Transactional
    public AdminStallDto createStall(CreateStallRequest request) {
        // Validate exhibition exists
        Exhibition exhibition = exhibitionRepository.findById(request.getExhibitionId())
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + request.getExhibitionId()));

        // Check if stall name already exists
        if (stallRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("A stall with this name already exists");
        }

        // Check if grid position is already occupied within the same exhibition
        boolean positionOccupied = stallRepository.findAllByExhibitionIdOrderByNameAsc(request.getExhibitionId())
                .stream()
                .anyMatch(s -> s.getGridRow() == request.getGridRow() && s.getGridCol() == request.getGridCol());
        
        if (positionOccupied) {
            throw new IllegalArgumentException("Grid position (row: " + request.getGridRow() + ", col: " + request.getGridCol() + ") is already occupied in this exhibition");
        }

        // Validate and parse size
        Stall.StallSize size;
        try {
            size = Stall.StallSize.valueOf(request.getSize().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid size. Must be: small, medium, or large");
        }

        // Create stall
        Stall stall = Stall.builder()
                .exhibition(exhibition)
                .name(request.getName())
                .size(size)
                .type(request.getType())
                .price(request.getPrice())
                .gridRow(request.getGridRow())
                .gridCol(request.getGridCol())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isConfirmed(false)
                .build();

        Stall saved = stallRepository.save(stall);
        return toAdminDto(saved);
    }

    @Transactional
    public AdminStallDto updateStall(Integer id, UpdateStallRequest request) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found with ID: " + id));

        // Validate exhibition exists
        Exhibition exhibition = exhibitionRepository.findById(request.getExhibitionId())
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found with ID: " + request.getExhibitionId()));

        // Check if stall name already exists (excluding current stall)
        if (stallRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("A stall with this name already exists");
        }

        // Check if grid position is already occupied (excluding current stall) within the same exhibition
        boolean positionOccupied = stallRepository.findAllByExhibitionIdOrderByNameAsc(request.getExhibitionId())
                .stream()
                .anyMatch(s -> !s.getId().equals(id) && 
                              s.getGridRow() == request.getGridRow() && 
                              s.getGridCol() == request.getGridCol());
        
        if (positionOccupied) {
            throw new IllegalArgumentException("Grid position (row: " + request.getGridRow() + ", col: " + request.getGridCol() + ") is already occupied in this exhibition");
        }

        // Validate and parse size
        Stall.StallSize size;
        try {
            size = Stall.StallSize.valueOf(request.getSize().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid size. Must be: small, medium, or large");
        }

        // Update stall
        stall.setExhibition(exhibition);
        stall.setName(request.getName());
        stall.setSize(size);
        stall.setType(request.getType());
        stall.setPrice(request.getPrice());
        stall.setGridRow(request.getGridRow());
        stall.setGridCol(request.getGridCol());
        stall.setDescription(request.getDescription());
        stall.setIsActive(request.getIsActive());

        Stall updated = stallRepository.save(stall);
        return toAdminDto(updated);
    }

    @Transactional
    public void deleteStall(Integer id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found with ID: " + id));

        // Check if stall has any reservations
        if (reservationRepository.existsByStalls_Id(id)) {
            throw new IllegalStateException("Cannot delete stall with existing reservations. Please cancel reservations first.");
        }

        stallRepository.delete(stall);
    }

    private AdminStallDto toAdminDto(Stall stall) {
        // Find if stall is reserved and get vendor name
        String reservedBy = null;
        if (Boolean.TRUE.equals(stall.getIsConfirmed())) {
            List<Reservation> reservations = reservationRepository.findByStalls_Id(stall.getId());
            if (!reservations.isEmpty()) {
                Reservation reservation = reservations.get(0);
                reservedBy = reservation.getUser() != null ? reservation.getUser().getName() : "Unknown";
            }
        }
        
        return AdminStallDto.fromEntity(stall, reservedBy);
    }
}
