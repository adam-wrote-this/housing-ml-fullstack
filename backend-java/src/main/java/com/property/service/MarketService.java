package com.property.service;

import com.property.dto.HousingFeaturesDto;
import com.property.dto.MarketDashboardDto;
import com.property.dto.MarketPropertyDto;
import com.property.dto.MarketSegmentDto;
import com.property.dto.MarketSummaryDto;
import com.property.dto.WhatIfRequestDto;
import com.property.dto.WhatIfResponseDto;
import com.property.model.HousingRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MlClientService mlClientService;
    private final HousingDatasetService housingDatasetService;

    @Cacheable("marketSegments")
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

    @Cacheable("marketDashboard")
    public MarketDashboardDto getDashboard() {
        List<HousingRecord> records = housingDatasetService.getRecords();
        List<MarketPropertyDto> properties = records.stream()
            .map(this::toMarketProperty)
            .toList();

        return MarketDashboardDto.builder()
            .summary(buildSummary(records))
            .segments(getMarketSegments())
            .properties(properties)
            .build();
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

    private MarketPropertyDto toMarketProperty(HousingRecord record) {
        return MarketPropertyDto.builder()
            .id(record.id())
            .squareFootage(record.squareFootage())
            .bedrooms(record.bedrooms())
            .bathrooms(record.bathrooms())
            .yearBuilt(record.yearBuilt())
            .lotSize(record.lotSize())
            .distanceToCityCenter(record.distanceToCityCenter())
            .schoolRating(record.schoolRating())
            .price(record.price())
            .build();
    }

    private MarketSummaryDto buildSummary(List<HousingRecord> records) {
        double averagePrice = records.stream().mapToDouble(record -> record.price()).average().orElse(0);
        double averageSquareFootage = records.stream()
            .mapToDouble(record -> record.squareFootage())
            .average()
            .orElse(0);
        double averageSchoolRating = records.stream()
            .mapToDouble(record -> record.schoolRating())
            .average()
            .orElse(0);
        double minPrice = records.stream().mapToDouble(record -> record.price()).min().orElse(0);
        double maxPrice = records.stream().mapToDouble(record -> record.price()).max().orElse(0);
        List<Double> sortedPrices = records.stream()
            .map(record -> record.price())
            .sorted(Comparator.naturalOrder())
            .toList();
        int middle = sortedPrices.size() / 2;
        double medianPrice = sortedPrices.size() % 2 == 0
            ? (sortedPrices.get(middle - 1) + sortedPrices.get(middle)) / 2
            : sortedPrices.get(middle);

        return MarketSummaryDto.builder()
            .totalProperties(records.size())
            .averagePrice(round(averagePrice))
            .medianPrice(round(medianPrice))
            .averageSquareFootage(round(averageSquareFootage))
            .averageSchoolRating(round(averageSchoolRating))
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .build();
    }

    private double[] filterByPriceRange(double minPrice, double maxPrice) {
        // Returns [count, sumPrice, minPrice, maxPrice, sumSqft] as raw stats
        int count = 0;
        double sumPrice = 0, minP = Double.MAX_VALUE, maxP = Double.MIN_VALUE, sumSqft = 0;
        for (HousingRecord record : housingDatasetService.getRecords()) {
            double price = record.price();
            if (price >= minPrice && price < maxPrice) {
                count++;
                sumPrice += price;
                minP = Math.min(minP, price);
                maxP = Math.max(maxP, price);
                sumSqft += record.squareFootage();
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

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
