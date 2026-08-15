package com.property.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketDashboardDto {
    private MarketSummaryDto summary;
    private List<MarketSegmentDto> segments;
    private List<MarketPropertyDto> properties;
}
