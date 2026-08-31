package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    // one reservation -> many reservation_stalls (explicit join entity)
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ReservationStall> reservationStalls = new HashSet<>();

    @Column(name = "reservation_date", nullable = false, updatable = false)
    private Instant reservationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "no_of_stalls_required", nullable = false)
    private Integer noOfStallsRequired = 1;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(name = "qr_code_token", length = 36)
    private String qrCodeToken;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReservationGenre> reservationGenres = new HashSet<>();

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED 
    }

    @PrePersist
    protected void onCreate() {
        if (reservationDate == null) reservationDate = Instant.now();
        // Generate QR code token if not set
        if (qrCodeToken == null) qrCodeToken = UUID.randomUUID().toString();
        if (status == null) status = Status.APPROVED;
        // Set noOfStallsRequired from actual reservationStalls count if not set
        if (noOfStallsRequired == null || noOfStallsRequired == 0) {
            noOfStallsRequired = reservationStalls != null ? reservationStalls.size() : 1;
        }
    }
    
    // Helper method to get stalls from reservationStalls
    public Set<Stall> getStalls() {
        Set<Stall> stalls = new HashSet<>();
        if (reservationStalls != null) {
            for (ReservationStall rs : reservationStalls) {
                if (rs.getStall() != null) {
                    stalls.add(rs.getStall());
                }
            }
        }
        return stalls;
    }

}
