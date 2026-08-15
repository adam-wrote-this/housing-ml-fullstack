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

    // Legacy aliases remain available for existing API clients.
    private Double predictedPrice;
    private Double baselinePrice;
    private Double priceDifference;
    private String status;
    private String message;
}
