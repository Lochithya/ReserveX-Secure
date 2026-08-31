package com.reservex.backend.repositories;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByUserOrderByReservationDateDesc(User user);

    int countByUser(User user);

    Optional<Reservation> findTopByUserOrderByReservationDateDesc(User user);

    Optional<Reservation> findByQrCodeToken(String qrCodeToken);

    @Query("""
            SELECT DISTINCT r
            FROM Reservation r
            JOIN FETCH r.user u
            LEFT JOIN FETCH r.reservationStalls rs
            LEFT JOIN FETCH rs.stall s
            LEFT JOIN FETCH r.reservationGenres rg
            """)
    List<Reservation> findAllWithDetails();

    @Query("""
            SELECT DISTINCT r
            FROM Reservation r
            JOIN FETCH r.user u
            LEFT JOIN FETCH r.reservationStalls rs
            LEFT JOIN FETCH rs.stall s
            LEFT JOIN FETCH r.reservationGenres rg
            WHERE r.user = :user
            ORDER BY r.reservationDate DESC
            """)
    List<Reservation> findByUserWithDetailsOrderByReservationDateDesc(@Param("user") User user);

    /**
     * Used to check whether a given stall is already attached to any reservation.
     */
    @Query("SELECT CASE WHEN COUNT(rs) > 0 THEN true ELSE false END FROM ReservationStall rs WHERE rs.stall.id = :stallId")
    boolean existsByStalls_Id(@Param("stallId") Integer stallId);

    /**
     * Find all reservations that contain the given stall.
     */
    @Query("SELECT DISTINCT rs.reservation FROM ReservationStall rs WHERE rs.stall.id = :stallId")
    List<Reservation> findByStalls_Id(@Param("stallId") Integer stallId);
    
    // Admin-specific methods
    long countByExhibitionId(Integer exhibitionId);
    
    List<Reservation> findAllByExhibitionIdOrderByReservationDateDesc(Integer exhibitionId);
}
