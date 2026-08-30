// Intercepts every request
// Reads Authorization: Bearer <token>
// Validates Auth0 OIDC tokens (via JWKS) or local JWTs (via JwtUtil)
// If valid, sets authenticated UserPrincipal into SecurityContext

package com.reservex.backend.config;

import com.reservex.backend.services.OidcUserProvisioningService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final OidcUserProvisioningService oidcUserProvisioningService;

    @Value("${auth0.domain:}")
    private String auth0Domain;

    private JwtDecoder auth0JwtDecoder;

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(auth0Domain)) {
            try {
                String cleanDomain = auth0Domain.trim();
                if (!cleanDomain.startsWith("http://") && !cleanDomain.startsWith("https://")) {
                    cleanDomain = "https://" + cleanDomain;
                }
                if (!cleanDomain.endsWith("/")) {
                    cleanDomain = cleanDomain + "/";
                }
                String jwkSetUri = cleanDomain + ".well-known/jwks.json";
                this.auth0JwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
                log.info("Initialized Auth0 OIDC JWT Decoder for JWKS: {}", jwkSetUri);
            } catch (Exception e) {
                log.warn("Could not initialize Auth0 JWT Decoder with domain {}: {}", auth0Domain, e.getMessage());
            }
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = getJwtFromRequest(request);
            if (StringUtils.hasText(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                boolean authenticated = false;

                // 1. Try Auth0 OIDC JWT Verification first if configured
                if (auth0JwtDecoder != null) {
                    try {
                        Jwt jwt = auth0JwtDecoder.decode(token);
                        UserPrincipal principal = oidcUserProvisioningService.provisionOrGetUser(jwt);
                        var auth = new UsernamePasswordAuthenticationToken(
                                principal, null, principal.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        authenticated = true;
                        log.debug("Auth0 OIDC token validated for user: {}", principal.getUsername());
                    } catch (Exception e) {
                        log.debug("Token is not a valid Auth0 OIDC token, attempting local JWT verification: {}", e.getMessage());
                    }
                }

                // 2. Fallback to Local HMAC JWT Verification
                if (!authenticated && jwtUtil.validateToken(token)) {
                    String emailOrUsername = jwtUtil.getEmailFromToken(token);
                    var userDetails = userDetailsService.loadUserByUsername(emailOrUsername);
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.debug("Local JWT token validated for user: {}", emailOrUsername);
                }
            }
        } catch (Exception e) {
            log.debug("Could not set user authentication in security context", e);
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
