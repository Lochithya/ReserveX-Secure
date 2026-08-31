package com.reservex.backend.repositories;

import com.reservex.backend.entity.Exhibition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExhibitionRepository extends JpaRepository<Exhibition, Integer> {
    List<Exhibition> findAllByOrderByStartDateAsc();
    
    // Admin-specific queries
    List<Exhibition> findAllByOrderByStartDateDesc();
    
    @Query("SELECT COUNT(e) FROM Exhibition e WHERE e.status = 'PUBLISHED'")
    long countPublishedExhibitions();
    
    @Query("SELECT COUNT(e) FROM Exhibition e WHERE e.status = 'DRAFT'")
    long countDraftExhibitions();
}
