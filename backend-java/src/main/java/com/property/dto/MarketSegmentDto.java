package com.property.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketSegmentDto {
    private String segment;
    private int count;
    private double avgPrice;
    private double minPrice;
    private double maxPrice;
    private double avgSquareFootage;
}
