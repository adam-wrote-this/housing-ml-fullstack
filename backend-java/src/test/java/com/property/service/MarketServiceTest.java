package com.property.service;

import com.property.dto.MarketDashboardDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

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
}
