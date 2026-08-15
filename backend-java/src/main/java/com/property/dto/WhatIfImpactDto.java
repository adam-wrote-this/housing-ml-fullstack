package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfImpactDto {
    private String field;
    private Double baselineValue;
    private Double scenarioValue;
    private Double priceImpact;
}
