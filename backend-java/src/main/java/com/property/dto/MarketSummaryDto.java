package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketSummaryDto {
    private int totalProperties;
    private double averagePrice;
    private double medianPrice;
    private double averageSquareFootage;
    private double averageSchoolRating;
    private double minPrice;
    private double maxPrice;
}
