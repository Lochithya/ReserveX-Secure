package com.reservex.backend.repositories;

import com.reservex.backend.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Integer> {
    List<Venue> findAllByOrderByNameAsc();
}
