package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "stalls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stall_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id")
    private Exhibition exhibition;

    @Column(name = "stall_name", nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StallSize size;

    @Column(nullable = false)
    private String type; // "Standard", "Premium", or "Corner Stall"

    private Double price;

    @Column(name = "grid_col")
    private int gridCol;

    @Column(name = "grid_row")
    private int gridRow;

    @Column(name = "is_Confirmed")
    private Boolean isConfirmed;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "stall", cascade = CascadeType.ALL)
    private Set<ReservationStall> reservationStalls = new HashSet<>();

    // Helper method to get reservations from reservationStalls
    public Set<Reservation> getReservations() {
        Set<Reservation> reservations = new HashSet<>();
        if (reservationStalls != null) {
            for (ReservationStall rs : reservationStalls) {
                if (rs.getReservation() != null) {
                    reservations.add(rs.getReservation());
                }
            }
        }
        return reservations;
    }

    public enum StallSize {
        small,
        medium,
        large
    }
}
