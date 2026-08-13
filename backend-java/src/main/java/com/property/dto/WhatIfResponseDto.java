package com.property.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfResponseDto {
    private Double predictedPrice;
    private Double baselinePrice;
    private Double priceDifference;
    private String status;
    private String message;
}
