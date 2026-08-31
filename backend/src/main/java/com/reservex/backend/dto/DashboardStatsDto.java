package com.reservex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalExhibitions;
    private long publishedExhibitions;
    private long draftExhibitions;
    private long totalStalls;
    private long reservedStalls;
    private long availableStalls;
    private long totalReservations;
    private long totalVendors;
    private BigDecimal totalRevenue;
}
