package com.property.service;

import com.property.model.HousingRecord;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HousingDatasetServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void loadsHousingRecordsFromConfiguredDataset() throws IOException {
        Path dataset = tempDir.resolve("housing.csv");
        Files.writeString(dataset, """
            id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price
            1,1250,2,1,1985,5200,3.2,7.1,185000
            2,1850,3,2,1998,7500,5.6,8.2,265000
            """);

        HousingDatasetService service = new HousingDatasetService(dataset.toString());

        List<HousingRecord> records = service.getRecords();
        assertThat(records).hasSize(2);
        assertThat(records.getFirst().squareFootage()).isEqualTo(1250);
        assertThat(records.getLast().price()).isEqualTo(265000);
        assertThat(service.getDatasetPath()).isEqualTo(dataset);
    }
}
