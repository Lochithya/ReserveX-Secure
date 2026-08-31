package com.reservex.backend.services;

import com.reservex.backend.dto.AdminVendorDto;
import com.reservex.backend.dto.AdminReservationDto;
import com.reservex.backend.entity.User;
import com.reservex.backend.repositories.ReservationRepository;
import com.reservex.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminVendorService {
    
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<AdminVendorDto> getAllVendors() {
        return userRepository.findAllByRoleOrderByCreatedAtDesc(User.Role.VENDOR).stream()
                .map(user -> {
                    int totalReservations = reservationRepository.countByUser(user);
                    return AdminVendorDto.fromEntity(user, totalReservations);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminVendorDto getVendorById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with ID: " + id));
        
        if (user.getRole() != User.Role.VENDOR) {
            throw new IllegalArgumentException("User is not a vendor");
        }
        
        int totalReservations = reservationRepository.countByUser(user);
        return AdminVendorDto.fromEntity(user, totalReservations);
    }

    @Transactional(readOnly = true)
    public List<AdminReservationDto> getVendorReservations(Integer vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with ID: " + vendorId));
        
        if (vendor.getRole() != User.Role.VENDOR) {
            throw new IllegalArgumentException("User is not a vendor");
        }
        
        return reservationRepository.findByUserWithDetailsOrderByReservationDateDesc(vendor).stream()
                .map(AdminReservationDto::fromEntity)
                .collect(Collectors.toList());
    }
}
