package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfOverridesDto {
    private Double squareFootage;
    private Double bedrooms;
    private Double bathrooms;
    private Double yearBuilt;
    private Double lotSize;
    private Double distanceToCityCenter;
    private Double schoolRating;
}
