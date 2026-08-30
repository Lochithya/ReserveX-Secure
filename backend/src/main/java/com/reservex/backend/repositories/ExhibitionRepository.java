package com.reservex.backend.repositories;

import com.reservex.backend.entity.Exhibition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExhibitionRepository extends JpaRepository<Exhibition, Integer> {
    List<Exhibition> findAllByOrderByStartDateAsc();
}
