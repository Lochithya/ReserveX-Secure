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

    @ManyToMany(mappedBy = "stalls") // to navigate Stall → Reservations.
    private Set<Reservation> reservations = new HashSet<>();

    public enum StallSize {
        small,
        medium,
        large
    }
}
