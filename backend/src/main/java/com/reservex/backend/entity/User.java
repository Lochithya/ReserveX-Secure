package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "business_name")
    private String businessName;

    @Builder.Default
    @Column(name = "no_of_current_bookings")
    private int noOfCurrentBookings = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "last_updated_at")
    private Instant lastUpdatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations = new ArrayList<>();

    public enum Role {
        VENDOR,
        EMPLOYEE
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = Instant.now();
        if (lastUpdatedAt == null)
            lastUpdatedAt = createdAt; // if never updated, keep same as createdAt
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = Instant.now();
    }
}
