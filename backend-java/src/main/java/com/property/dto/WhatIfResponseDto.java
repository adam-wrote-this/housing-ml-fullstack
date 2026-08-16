package com.property.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfResponseDto {
    private Long propertyId;
    private Double actualPrice;
    private Double baselinePrediction;
    private Double scenarioPrediction;
    private Double percentageDifference;
    private List<WhatIfImpactDto> impacts;

    // 保留旧别名以兼容现有 API 客户端。
    private Double predictedPrice;
    private Double baselinePrice;
    private Double priceDifference;
    private String status;
    private String message;
}
