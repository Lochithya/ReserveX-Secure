package com.reservex.backend.services;

import com.reservex.backend.dto.ExhibitionDto;
import com.reservex.backend.entity.Exhibition;
import com.reservex.backend.repositories.ExhibitionRepository;
import com.reservex.backend.repositories.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ExhibitionService {
    private final ExhibitionRepository exhibitionRepository;
    private final StallRepository stallRepository;

    @Transactional(readOnly = true)
    public List<ExhibitionDto> find(String query, String city, String timeframe) {
        LocalDate today = LocalDate.now();
        String normalizedQuery = normalize(query);
        String normalizedCity = normalize(city);
        String normalizedTimeframe = timeframe == null ? "ALL" : timeframe.toUpperCase(Locale.ROOT);
        return exhibitionRepository.findAllByOrderByStartDateAsc().stream()
                .filter(e -> e.getStatus() == Exhibition.Status.PUBLISHED)
                .filter(e -> matchesTimeframe(e, today, normalizedTimeframe))
                .filter(e -> normalizedQuery.isEmpty() || searchable(e).contains(normalizedQuery))
                .filter(e -> normalizedCity.isEmpty() || normalize(e.getVenue().getCity()).contains(normalizedCity))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExhibitionDto get(Integer id) {
        Exhibition exhibition = exhibitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibition not found"));
        if (exhibition.getStatus() != Exhibition.Status.PUBLISHED) throw new IllegalArgumentException("Exhibition is not available");
        return toDto(exhibition);
    }

    private ExhibitionDto toDto(Exhibition exhibition) {
        long total = stallRepository.countByExhibitionIdAndIsActiveTrue(exhibition.getId());
        long available = total - stallRepository.countByExhibitionIdAndIsActiveTrueAndIsConfirmedTrue(exhibition.getId());
        return ExhibitionDto.fromEntity(exhibition, total, available);
    }

    private boolean matchesTimeframe(Exhibition exhibition, LocalDate today, String timeframe) {
        return switch (timeframe) {
            case "CURRENT" -> !exhibition.getStartDate().isAfter(today) && !exhibition.getEndDate().isBefore(today);
            case "UPCOMING" -> exhibition.getStartDate().isAfter(today);
            default -> !exhibition.getEndDate().isBefore(today);
        };
    }
    private String searchable(Exhibition e) { return normalize(e.getName() + " " + e.getDescription() + " " + e.getVenue().getName() + " " + e.getVenue().getCity()); }
    private String normalize(String value) { return value == null ? "" : value.toLowerCase(Locale.ROOT).trim(); }
}
