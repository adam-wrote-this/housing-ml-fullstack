package com.property.controller;

import com.property.dto.HealthResponseDto;
import com.property.dto.MarketDashboardDto;
import com.property.dto.MarketSegmentDto;
import com.property.dto.WhatIfRequestDto;
import com.property.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** 提供市场看板、价格分段、What-if 分析和健康检查接口。 */
@RestController
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    /** 返回 Java 服务自身的运行状态，不级联检查 ML 服务。 */
    @GetMapping("/health")
    public ResponseEntity<HealthResponseDto> health() {
        return ResponseEntity.ok(HealthResponseDto.builder()
            .status("ok")
            .service("backend-java")
            .version("1.0.0")
            .timestamp(Instant.now().toString())
            .build());
    }

    /** 返回按价格区间聚合的市场统计结果。 */
    @GetMapping("/market/segments")
    public ResponseEntity<List<MarketSegmentDto>> getMarketSegments() {
        return ResponseEntity.ok(marketService.getMarketSegments());
    }

    /** 返回市场汇总指标、价格分段和完整房源列表。 */
    @GetMapping("/market/dashboard")
    public ResponseEntity<MarketDashboardDto> getDashboard() {
        return ResponseEntity.ok(marketService.getDashboard());
    }

    /** 接收基准房源或完整特征，通过 ML 服务执行 What-if 预测。 */
    @PostMapping("/market/whatif")
    public Mono<ResponseEntity<?>> whatIf(@RequestBody WhatIfRequestDto request) {
        if (request.getSquareFootage() == null || request.getBedrooms() == null
                || request.getBathrooms() == null || request.getYearBuilt() == null
                || request.getLotSize() == null || request.getDistanceToCityCenter() == null
                || request.getSchoolRating() == null) {
            if (request.getPropertyId() == null) {
                return Mono.just(ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", "All 7 housing features are required")));
            }
        }
        return marketService.whatIf(request)
            .map(response -> ResponseEntity.ok().body(response));
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
