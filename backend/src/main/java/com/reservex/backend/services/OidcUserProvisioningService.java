package com.reservex.backend.services;

import com.reservex.backend.config.UserPrincipal;
import com.reservex.backend.entity.User;
import com.reservex.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OidcUserProvisioningService {

    private final UserRepository userRepository;

    @Transactional
    public UserPrincipal provisionOrGetUser(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String nickname = jwt.getClaimAsString("nickname");
        String sub = jwt.getSubject();

        // Optional custom claims from Auth0
        String customUsername = jwt.getClaimAsString("https://reservex.lk/username");
        String customBusinessName = jwt.getClaimAsString("https://reservex.lk/business_name");
        String customContactNumber = jwt.getClaimAsString("https://reservex.lk/contact_number");

        // Derive username: First name from full name (e.g. "Lochithya Hettiarachchi" -> "Lochithya")
        String derivedUsername;
        if (customUsername != null && !customUsername.isBlank()) {
            derivedUsername = customUsername;
        } else if (name != null && !name.trim().isBlank()) {
            derivedUsername = name.trim().split("\\s+")[0];
        } else if (nickname != null && !nickname.isBlank()) {
            derivedUsername = nickname;
        } else if (email != null && email.contains("@")) {
            derivedUsername = email.split("@")[0];
        } else {
            derivedUsername = sub != null ? sub : "vendor";
        }

        // Derive business name: <username> + " Shop" (e.g. "Lochithya Shop")
        String derivedBusinessName;
        if (customBusinessName != null && !customBusinessName.isBlank()) {
            derivedBusinessName = customBusinessName;
        } else {
            derivedBusinessName = derivedUsername + " Shop";
        }

        String contactNumber = (customContactNumber != null && !customContactNumber.isBlank())
                ? customContactNumber
                : "";

        // 1. Find existing user ONLY by verified email (never by username, to prevent collision hijacking)
        Optional<User> existingUser = Optional.empty();
        if (email != null && !email.isBlank()) {
            existingUser = userRepository.findByEmail(email);
        }

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            boolean updated = false;
            if ((user.getName() == null || user.getName().isBlank()) && name != null) {
                user.setName(name);
                updated = true;
            }
            if ((user.getBusinessName() == null || user.getBusinessName().isBlank())) {
                user.setBusinessName(derivedBusinessName);
                updated = true;
            }
            if ((user.getContactNumber() == null || user.getContactNumber().isBlank()) && !contactNumber.isBlank()) {
                user.setContactNumber(contactNumber);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }
        } else {
            // 2. JIT Provision new Vendor user: Resolve username collisions with incremental numbers
            String uniqueUsername = derivedUsername;
            int counter = 1;
            while (userRepository.existsByUsername(uniqueUsername)) {
                uniqueUsername = derivedUsername + counter++;
            }

            // If username was incremented (e.g. John1), sync default shop name to "John1 Shop"
            String finalBusinessName = (customBusinessName != null && !customBusinessName.isBlank())
                    ? customBusinessName
                    : uniqueUsername + " Shop";

            user = User.builder()
                    .name(name != null && !name.isBlank() ? name : uniqueUsername)
                    .username(uniqueUsername)
                    .email(email != null && !email.isBlank() ? email : uniqueUsername + "@auth0.local")
                    .businessName(finalBusinessName)
                    .contactNumber(contactNumber)
                    .password(null) // Password is NULL for OIDC users
                    .role(User.Role.VENDOR)
                    .noOfCurrentBookings(0)
                    .build();

            user = userRepository.save(user);
            log.info("JIT provisioned new vendor from Auth0 OIDC: name='{}', username='{}', businessName='{}', email='{}'",
                    user.getName(), user.getUsername(), user.getBusinessName(), user.getEmail());
        }

        return new UserPrincipal(user);
    }
}
