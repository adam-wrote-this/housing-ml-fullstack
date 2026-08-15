package com.property.service;

import com.property.dto.HousingFeaturesDto;
import com.property.dto.MarketDashboardDto;
import com.property.dto.MarketPropertyDto;
import com.property.dto.MarketSegmentDto;
import com.property.dto.MarketSummaryDto;
import com.property.dto.WhatIfRequestDto;
import com.property.dto.WhatIfResponseDto;
import com.property.dto.WhatIfImpactDto;
import com.property.dto.WhatIfOverridesDto;
import com.property.config.CacheConfig;
import com.property.model.HousingRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MlClientService mlClientService;
    private final HousingDatasetService housingDatasetService;

    @Cacheable(value = CacheConfig.MARKET_SEGMENTS, sync = true)
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

    @Cacheable(value = CacheConfig.MARKET_DASHBOARD, sync = true)
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

    @Cacheable(value = CacheConfig.WHAT_IF_PREDICTIONS, sync = true)
    public WhatIfResponseDto whatIf(WhatIfRequestDto req) {
        if (req.getPropertyId() != null) {
            return analyzePropertyScenario(req);
        }
        return analyzeLegacyScenario(req);
    }

    private WhatIfResponseDto analyzePropertyScenario(WhatIfRequestDto request) {
        HousingRecord record = housingDatasetService.getRecords().stream()
            .filter(candidate -> candidate.id() == request.getPropertyId())
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException(
                "Housing property not found: " + request.getPropertyId()
            ));
        WhatIfOverridesDto overrides = request.getOverrides();
        if (overrides == null) {
            throw new IllegalArgumentException("Scenario overrides are required");
        }

        HousingFeaturesDto baseline = toFeatures(record);
        HousingFeaturesDto scenario = applyOverrides(baseline, overrides);
        validateScenario(scenario);

        List<ImpactCandidate> candidates = buildImpactCandidates(baseline, scenario);
        List<HousingFeaturesDto> predictionInputs = new ArrayList<>();
        predictionInputs.add(baseline);
        predictionInputs.add(scenario);
        candidates.forEach(candidate -> predictionInputs.add(candidate.isolatedFeatures()));

        List<Double> predictions = mlClientService.predictBatch(predictionInputs);
        double baselinePrediction = predictions.get(0);
        double scenarioPrediction = predictions.get(1);
        double priceDifference = scenarioPrediction - baselinePrediction;
        double percentageDifference = baselinePrediction == 0
            ? 0
            : priceDifference / baselinePrediction * 100;

        List<WhatIfImpactDto> impacts = new ArrayList<>();
        for (int index = 0; index < candidates.size(); index++) {
            ImpactCandidate candidate = candidates.get(index);
            impacts.add(WhatIfImpactDto.builder()
                .field(candidate.field())
                .baselineValue(candidate.baselineValue())
                .scenarioValue(candidate.scenarioValue())
                .priceImpact(round(predictions.get(index + 2) - baselinePrediction))
                .build());
        }

        return WhatIfResponseDto.builder()
            .propertyId(record.id())
            .actualPrice(record.price())
            .baselinePrediction(round(baselinePrediction))
            .scenarioPrediction(round(scenarioPrediction))
            .priceDifference(round(priceDifference))
            .percentageDifference(round(percentageDifference))
            .impacts(impacts)
            .predictedPrice(round(scenarioPrediction))
            .baselinePrice(round(baselinePrediction))
            .status("success")
            .message("Property scenario analysis completed")
            .build();
    }

    private WhatIfResponseDto analyzeLegacyScenario(WhatIfRequestDto req) {
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
        Double percentageDifference = null;
        if (baselinePrice != null && baselinePrice != 0 && priceDifference != null) {
            percentageDifference = round(
                priceDifference.doubleValue() / baselinePrice.doubleValue() * 100
            );
        }

        return WhatIfResponseDto.builder()
            .baselinePrediction(baselinePrice)
            .scenarioPrediction(predicted)
            .percentageDifference(percentageDifference)
            .impacts(List.of())
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

    private HousingFeaturesDto toFeatures(HousingRecord record) {
        return HousingFeaturesDto.builder()
            .squareFootage(record.squareFootage())
            .bedrooms((double) record.bedrooms())
            .bathrooms(record.bathrooms())
            .yearBuilt((double) record.yearBuilt())
            .lotSize(record.lotSize())
            .distanceToCityCenter(record.distanceToCityCenter())
            .schoolRating(record.schoolRating())
            .build();
    }

    private HousingFeaturesDto applyOverrides(
            HousingFeaturesDto baseline,
            WhatIfOverridesDto overrides) {
        return HousingFeaturesDto.builder()
            .squareFootage(valueOrBaseline(overrides.getSquareFootage(), baseline.getSquareFootage()))
            .bedrooms(valueOrBaseline(overrides.getBedrooms(), baseline.getBedrooms()))
            .bathrooms(valueOrBaseline(overrides.getBathrooms(), baseline.getBathrooms()))
            .yearBuilt(valueOrBaseline(overrides.getYearBuilt(), baseline.getYearBuilt()))
            .lotSize(valueOrBaseline(overrides.getLotSize(), baseline.getLotSize()))
            .distanceToCityCenter(valueOrBaseline(
                overrides.getDistanceToCityCenter(),
                baseline.getDistanceToCityCenter()
            ))
            .schoolRating(valueOrBaseline(overrides.getSchoolRating(), baseline.getSchoolRating()))
            .build();
    }

    private double valueOrBaseline(Double override, Double baseline) {
        return override == null ? baseline : override;
    }

    private void validateScenario(HousingFeaturesDto scenario) {
        requireRange("squareFootage", scenario.getSquareFootage(), 1, 100000);
        requireRange("bedrooms", scenario.getBedrooms(), 0, 100);
        requireRange("bathrooms", scenario.getBathrooms(), 0, 100);
        requireRange("yearBuilt", scenario.getYearBuilt(), 1800, 2200);
        requireRange("lotSize", scenario.getLotSize(), 1, 10000000);
        requireRange("distanceToCityCenter", scenario.getDistanceToCityCenter(), 0, 10000);
        requireRange("schoolRating", scenario.getSchoolRating(), 0, 10);
    }

    private void requireRange(String field, Double value, double minimum, double maximum) {
        if (value == null || !Double.isFinite(value) || value < minimum || value > maximum) {
            throw new IllegalArgumentException(
                field + " must be between " + minimum + " and " + maximum
            );
        }
    }

    private List<ImpactCandidate> buildImpactCandidates(
            HousingFeaturesDto baseline,
            HousingFeaturesDto scenario) {
        List<ImpactCandidate> candidates = new ArrayList<>();
        addImpactCandidate(candidates, "squareFootage", baseline.getSquareFootage(),
            scenario.getSquareFootage(), baseline);
        addImpactCandidate(candidates, "bedrooms", baseline.getBedrooms(),
            scenario.getBedrooms(), baseline);
        addImpactCandidate(candidates, "bathrooms", baseline.getBathrooms(),
            scenario.getBathrooms(), baseline);
        addImpactCandidate(candidates, "yearBuilt", baseline.getYearBuilt(),
            scenario.getYearBuilt(), baseline);
        addImpactCandidate(candidates, "lotSize", baseline.getLotSize(),
            scenario.getLotSize(), baseline);
        addImpactCandidate(candidates, "distanceToCityCenter", baseline.getDistanceToCityCenter(),
            scenario.getDistanceToCityCenter(), baseline);
        addImpactCandidate(candidates, "schoolRating", baseline.getSchoolRating(),
            scenario.getSchoolRating(), baseline);
        return candidates;
    }

    private void addImpactCandidate(
            List<ImpactCandidate> candidates,
            String field,
            double baselineValue,
            double scenarioValue,
            HousingFeaturesDto baseline) {
        if (Double.compare(baselineValue, scenarioValue) == 0) {
            return;
        }
        HousingFeaturesDto isolated = copyFeatures(baseline);
        switch (field) {
            case "squareFootage" -> isolated.setSquareFootage(scenarioValue);
            case "bedrooms" -> isolated.setBedrooms(scenarioValue);
            case "bathrooms" -> isolated.setBathrooms(scenarioValue);
            case "yearBuilt" -> isolated.setYearBuilt(scenarioValue);
            case "lotSize" -> isolated.setLotSize(scenarioValue);
            case "distanceToCityCenter" -> isolated.setDistanceToCityCenter(scenarioValue);
            case "schoolRating" -> isolated.setSchoolRating(scenarioValue);
            default -> throw new IllegalArgumentException("Unsupported scenario field: " + field);
        }
        candidates.add(new ImpactCandidate(field, baselineValue, scenarioValue, isolated));
    }

    private HousingFeaturesDto copyFeatures(HousingFeaturesDto source) {
        return HousingFeaturesDto.builder()
            .squareFootage(source.getSquareFootage())
            .bedrooms(source.getBedrooms())
            .bathrooms(source.getBathrooms())
            .yearBuilt(source.getYearBuilt())
            .lotSize(source.getLotSize())
            .distanceToCityCenter(source.getDistanceToCityCenter())
            .schoolRating(source.getSchoolRating())
            .build();
    }

    private record ImpactCandidate(
        String field,
        double baselineValue,
        double scenarioValue,
        HousingFeaturesDto isolatedFeatures
    ) {
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
