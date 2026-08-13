package com.property.service;

import com.property.dto.HousingFeaturesDto;
import com.property.dto.MarketSegmentDto;
import com.property.dto.WhatIfRequestDto;
import com.property.dto.WhatIfResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MlClientService mlClientService;

    // Representative sample data covering low/mid/high price segments
    // Each record: [squareFootage, bedrooms, bathrooms, yearBuilt, lotSize, distanceToCityCenter, schoolRating, price]
    private static final double[][] SAMPLE_DATA = {
        // Low segment (<200k)
        { 850,  2, 1.0, 1975, 4500, 18.0, 4.5, 125000 },
        { 920,  2, 1.0, 1968, 3800, 22.0, 4.0, 138000 },
        { 1050, 3, 1.5, 1980, 5200, 20.0, 5.0, 155000 },
        { 980,  2, 1.0, 1972, 4100, 25.0, 3.5, 142000 },
        { 1100, 3, 1.5, 1985, 5800, 19.0, 5.5, 168000 },
        { 1200, 3, 2.0, 1990, 6000, 17.5, 5.0, 185000 },
        // Mid segment (200k-350k)
        { 1450, 3, 2.0, 1998, 7500,  9.5, 7.0, 215000 },
        { 1600, 3, 2.0, 2000, 8000, 10.0, 7.5, 238000 },
        { 1750, 4, 2.5, 2003, 8500,  8.0, 8.0, 262000 },
        { 1900, 4, 2.5, 2005, 9000,  7.5, 8.0, 285000 },
        { 2000, 4, 3.0, 2007, 9500,  7.0, 8.5, 310000 },
        { 2100, 4, 3.0, 2008, 9200,  6.5, 8.5, 335000 },
        // High segment (>350k)
        { 2400, 4, 3.0, 2010, 11000, 4.5, 9.0, 375000 },
        { 2600, 4, 3.5, 2012, 12000, 4.0, 9.0, 415000 },
        { 2900, 5, 3.5, 2014, 13500, 3.5, 9.5, 468000 },
        { 3200, 5, 4.0, 2016, 15000, 3.0, 9.5, 520000 },
        { 3500, 5, 4.0, 2018, 16500, 2.5, 9.8, 590000 },
        { 3800, 5, 4.5, 2020, 18000, 2.0, 9.8, 650000 },
    };

    public List<MarketSegmentDto> getMarketSegments() {
        // Low: <200k
        double[] low = filterByPriceRange(0, 200000);
        // Mid: 200k–350k
        double[] mid = filterByPriceRange(200000, 350000);
        // High: >350k
        double[] high = filterByPriceRange(350000, Double.MAX_VALUE);

        return List.of(
            buildSegment("Under $200k", low),
            buildSegment("$200k - $350k", mid),
            buildSegment("Over $350k", high)
        );
    }

    public WhatIfResponseDto whatIf(WhatIfRequestDto req) {
        HousingFeaturesDto features = toFeatures(req);
        Double predicted = mlClientService.predict(features);

        Double baselinePrice = null;
        Double priceDifference = null;

        if (req.getBaselineSquareFootage() != null) {
            HousingFeaturesDto baseline = HousingFeaturesDto.builder()
                .squareFootage(req.getBaselineSquareFootage())
                .bedrooms(req.getBedrooms())
                .bathrooms(req.getBathrooms())
                .yearBuilt(req.getYearBuilt())
                .lotSize(req.getLotSize())
                .distanceToCityCenter(req.getDistanceToCityCenter())
                .schoolRating(req.getSchoolRating())
                .build();
            baselinePrice = mlClientService.predict(baseline);
            priceDifference = predicted - baselinePrice;
        }

        return WhatIfResponseDto.builder()
            .predictedPrice(predicted)
            .baselinePrice(baselinePrice)
            .priceDifference(priceDifference)
            .status("success")
            .message("What-if prediction completed")
            .build();
    }

    // ---- helpers ----

    private HousingFeaturesDto toFeatures(WhatIfRequestDto req) {
        return HousingFeaturesDto.builder()
            .squareFootage(req.getSquareFootage())
            .bedrooms(req.getBedrooms())
            .bathrooms(req.getBathrooms())
            .yearBuilt(req.getYearBuilt())
            .lotSize(req.getLotSize())
            .distanceToCityCenter(req.getDistanceToCityCenter())
            .schoolRating(req.getSchoolRating())
            .build();
    }

    private double[] filterByPriceRange(double minPrice, double maxPrice) {
        // Returns [count, sumPrice, minPrice, maxPrice, sumSqft] as raw stats
        int count = 0;
        double sumPrice = 0, minP = Double.MAX_VALUE, maxP = Double.MIN_VALUE, sumSqft = 0;
        for (double[] row : SAMPLE_DATA) {
            double price = row[7];
            if (price >= minPrice && price < maxPrice) {
                count++;
                sumPrice += price;
                minP = Math.min(minP, price);
                maxP = Math.max(maxP, price);
                sumSqft += row[0];
            }
        }
        return new double[]{ count, sumPrice, minP, maxP, sumSqft };
    }

    private MarketSegmentDto buildSegment(String label, double[] stats) {
        int count = (int) stats[0];
        if (count == 0) {
            return MarketSegmentDto.builder().segment(label).count(0).build();
        }
        return MarketSegmentDto.builder()
            .segment(label)
            .count(count)
            .avgPrice(Math.round(stats[1] / count * 100.0) / 100.0)
            .minPrice(stats[2])
            .maxPrice(stats[3])
            .avgSquareFootage(Math.round(stats[4] / count * 100.0) / 100.0)
            .build();
    }
}
