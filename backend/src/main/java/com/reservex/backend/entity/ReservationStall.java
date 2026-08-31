package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "reservation_stalls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationStall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_stall_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @Column(name = "reserved_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal reservedPrice;

    @Column(name = "business_category", nullable = false)
    private String businessCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "allocation_status", nullable = false)
    @Builder.Default
    private AllocationStatus allocationStatus = AllocationStatus.HELD;

    public enum AllocationStatus {
        HELD,
        ALLOCATED,
        RELEASED
    }
}
