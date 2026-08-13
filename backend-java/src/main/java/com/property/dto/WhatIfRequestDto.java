package com.property.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfRequestDto {
    private Double squareFootage;
    private Double bedrooms;
    private Double bathrooms;
    private Double yearBuilt;
    private Double lotSize;
    private Double distanceToCityCenter;
    private Double schoolRating;
    private Double baselineSquareFootage;
}
