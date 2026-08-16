package com.property.service;

import com.property.dto.MarketDashboardDto;
import com.property.dto.WhatIfOverridesDto;
import com.property.dto.WhatIfRequestDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyList;

class MarketServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void buildsDashboardFromHousingDataset() throws IOException {
        Path dataset = tempDir.resolve("housing.csv");
        Files.writeString(dataset, """
            id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price
            1,1250,2,1,1985,5200,3.2,7.1,185000
            2,1850,3,2,1998,7500,5.6,8.2,265000
            3,2400,4,3,2010,10500,8.2,9.0,410000
            """);

        HousingDatasetService datasetService = new HousingDatasetService(dataset.toString());
        MarketService service = new MarketService(mock(MlClientService.class), datasetService);

        MarketDashboardDto dashboard = service.getDashboard();

        assertThat(dashboard.getProperties()).hasSize(3);
        assertThat(dashboard.getSegments())
            .extracting("count")
            .containsExactly(1, 1, 1);
        assertThat(dashboard.getSummary().getTotalProperties()).isEqualTo(3);
        assertThat(dashboard.getSummary().getAveragePrice()).isEqualTo(286666.67);
        assertThat(dashboard.getSummary().getMedianPrice()).isEqualTo(265000);
        assertThat(dashboard.getProperties().getFirst().getId()).isEqualTo(1);
    }

    @Test
    void comparesAPropertyBaselineWithScenarioOverrides() throws IOException {
        Path dataset = tempDir.resolve("housing.csv");
        Files.writeString(dataset, """
            id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price
            1,1250,2,1,1985,5200,3.2,7.1,185000
            """);
        MlClientService mlClient = mock(MlClientService.class);
        when(mlClient.predictBatch(anyList()))
            .thenReturn(Mono.just(java.util.List.of(180000.0, 215000.0, 215000.0)));
        MarketService service = new MarketService(mlClient, new HousingDatasetService(dataset.toString()));

        var response = service.whatIf(WhatIfRequestDto.builder()
            .propertyId(1L)
            .overrides(WhatIfOverridesDto.builder().squareFootage(1500.0).build())
            .build()).block();

        assertThat(response).isNotNull();
        assertThat(response.getPropertyId()).isEqualTo(1);
        assertThat(response.getActualPrice()).isEqualTo(185000);
        assertThat(response.getBaselinePrediction()).isEqualTo(180000);
        assertThat(response.getScenarioPrediction()).isEqualTo(215000);
        assertThat(response.getPriceDifference()).isEqualTo(35000);
        assertThat(response.getPercentageDifference()).isEqualTo(19.44);
        assertThat(response.getImpacts()).singleElement().satisfies(impact -> {
            assertThat(impact.getField()).isEqualTo("squareFootage");
            assertThat(impact.getBaselineValue()).isEqualTo(1250);
            assertThat(impact.getScenarioValue()).isEqualTo(1500);
            assertThat(impact.getPriceImpact()).isEqualTo(35000);
        });
        verify(mlClient).predictBatch(anyList());
    }

    @Test
    void rejectsUnknownBaselineProperty() throws IOException {
        Path dataset = tempDir.resolve("housing.csv");
        Files.writeString(dataset, """
            id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price
            1,1250,2,1,1985,5200,3.2,7.1,185000
            """);
        MarketService service = new MarketService(
            mock(MlClientService.class),
            new HousingDatasetService(dataset.toString())
        );

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.whatIf(
            WhatIfRequestDto.builder()
                .propertyId(99L)
                .overrides(WhatIfOverridesDto.builder().squareFootage(1500.0).build())
                .build()
        ).block()).isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("99");
    }
}
