package com.reservex.backend.services;

import com.reservex.backend.dto.DashboardStatsDto;
import com.reservex.backend.repositories.ExhibitionRepository;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.StallRepository;
import com.reservex.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    
    private final ExhibitionRepository exhibitionRepository;
    private final StallRepository stallRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalExhibitions = exhibitionRepository.count();
        long publishedExhibitions = exhibitionRepository.countPublishedExhibitions();
        long draftExhibitions = exhibitionRepository.countDraftExhibitions();
        
        long totalStalls = stallRepository.count();
        // Count reserved stalls across all exhibitions
        long reservedStalls = stallRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsConfirmed()))
                .count();
        long availableStalls = totalStalls - reservedStalls;
        
        long totalReservations = reservationRepository.count();
        long totalVendors = userRepository.countVendors();
        
        // Calculate total revenue (sum of all reservation stall prices)
        BigDecimal totalRevenue = stallRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsConfirmed()))
                .map(s -> BigDecimal.valueOf(s.getPrice() != null ? s.getPrice() : 0.0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return DashboardStatsDto.builder()
                .totalExhibitions(totalExhibitions)
                .publishedExhibitions(publishedExhibitions)
                .draftExhibitions(draftExhibitions)
                .totalStalls(totalStalls)
                .reservedStalls(reservedStalls)
                .availableStalls(availableStalls)
                .totalReservations(totalReservations)
                .totalVendors(totalVendors)
                .totalRevenue(totalRevenue)
                .build();
    }
}
