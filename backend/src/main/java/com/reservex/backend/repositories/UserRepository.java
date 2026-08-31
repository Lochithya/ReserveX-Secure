package com.reservex.backend.repositories;

import com.reservex.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
    
    // Admin-specific queries
    List<User> findAllByRoleOrderByCreatedAtDesc(User.Role role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'VENDOR'")
    long countVendors();
}
