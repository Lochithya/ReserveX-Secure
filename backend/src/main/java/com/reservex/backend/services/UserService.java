package com.reservex.backend.services;

import com.reservex.backend.dto.ChangePasswordRequest;
import com.reservex.backend.dto.UpdateProfileRequest;
import com.reservex.backend.dto.UserProfileDto;
import com.reservex.backend.entity.User;
import com.reservex.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Pattern PASSWORD_POLICY = Pattern.compile(
            "^(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileDto getMyProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Safety for older rows: if lastUpdatedAt was not set, treat as never updated.
        if (user.getLastUpdatedAt() == null) {
            user.setLastUpdatedAt(user.getCreatedAt());
        }

        return UserProfileDto.fromEntity(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new IllegalArgumentException("Full name cannot be empty");
        }
        if (request.getUsername() == null || request.getUsername().trim().isBlank()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (request.getBusinessName() == null || request.getBusinessName().trim().isBlank()) {
            throw new IllegalArgumentException("Business name cannot be empty");
        }

        String cleanUsername = request.getUsername().trim();
        // Validate username uniqueness across other users
        Optional<User> userWithUsername = userRepository.findByUsername(cleanUsername);
        if (userWithUsername.isPresent() && !userWithUsername.get().getId().equals(userId)) {
            throw new IllegalArgumentException("Username '" + cleanUsername + "' is already taken by another account");
        }

        user.setName(request.getName().trim());
        user.setUsername(cleanUsername);
        user.setBusinessName(request.getBusinessName().trim());
        user.setContactNumber(request.getContactNumber() != null ? request.getContactNumber().trim() : "");
        user.setLastUpdatedAt(Instant.now());

        User saved = userRepository.save(user);
        return UserProfileDto.fromEntity(saved);
    }

    @Transactional
    public UserProfileDto changeMyPassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // OIDC / SSO Users have password = null
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "This account is authenticated via Social SSO (OIDC). Password management is handled by your Identity Provider (e.g. Google, Microsoft, GitHub)."
            );
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank() ||
            request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {
            throw new IllegalArgumentException("New password and confirmation password are required");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation password do not match");
        }

        // Current password validation (mandatory for manual accounts)
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // New password must not be same as current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLastUpdatedAt(Instant.now());

        User saved = userRepository.save(user);
        return UserProfileDto.fromEntity(saved);
    }
}

