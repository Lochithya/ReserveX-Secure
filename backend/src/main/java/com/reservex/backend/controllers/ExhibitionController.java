package com.reservex.backend.controllers;

import com.reservex.backend.dto.ExhibitionDto;
import com.reservex.backend.dto.StallDto;
import com.reservex.backend.services.ExhibitionService;
import com.reservex.backend.services.StallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exhibitions")
@RequiredArgsConstructor
public class ExhibitionController {
    private final ExhibitionService exhibitionService;
    private final StallService stallService;

    @GetMapping
    public ResponseEntity<List<ExhibitionDto>> find(@RequestParam(required = false) String query,
                                                     @RequestParam(required = false) String city,
                                                     @RequestParam(required = false, defaultValue = "ALL") String timeframe) {
        return ResponseEntity.ok(exhibitionService.find(query, city, timeframe));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExhibitionDto> get(@PathVariable Integer id) { return ResponseEntity.ok(exhibitionService.get(id)); }

    @GetMapping("/{id}/stalls")
    public ResponseEntity<List<StallDto>> getStalls(@PathVariable Integer id) {
        exhibitionService.get(id);
        return ResponseEntity.ok(stallService.getStallsForExhibition(id));
    }
}
