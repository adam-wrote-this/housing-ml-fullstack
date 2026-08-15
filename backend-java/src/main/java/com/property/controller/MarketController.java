package com.property.controller;

import com.property.dto.HealthResponseDto;
import com.property.dto.MarketDashboardDto;
import com.property.dto.MarketSegmentDto;
import com.property.dto.WhatIfRequestDto;
import com.property.dto.WhatIfResponseDto;
import com.property.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/health")
    public ResponseEntity<HealthResponseDto> health() {
        return ResponseEntity.ok(HealthResponseDto.builder()
            .status("ok")
            .service("backend-java")
            .version("1.0.0")
            .timestamp(Instant.now().toString())
            .build());
    }

    @GetMapping("/market/segments")
    public ResponseEntity<List<MarketSegmentDto>> getMarketSegments() {
        return ResponseEntity.ok(marketService.getMarketSegments());
    }

    @GetMapping("/market/dashboard")
    public ResponseEntity<MarketDashboardDto> getDashboard() {
        return ResponseEntity.ok(marketService.getDashboard());
    }

    @PostMapping("/market/whatif")
    public ResponseEntity<?> whatIf(@RequestBody WhatIfRequestDto request) {
        if (request.getPropertyId() != null) {
            return ResponseEntity.ok(marketService.whatIf(request));
        }
        if (request.getSquareFootage() == null || request.getBedrooms() == null
                || request.getBathrooms() == null || request.getYearBuilt() == null
                || request.getLotSize() == null || request.getDistanceToCityCenter() == null
                || request.getSchoolRating() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("status", "error", "message", "All 7 housing features are required"));
        }
        WhatIfResponseDto response = marketService.whatIf(request);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(Map.of("status", "error", "message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(503)
            .body(Map.of("status", "error", "message", ex.getMessage()));
    }
}
