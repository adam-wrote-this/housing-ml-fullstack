package com.property.service;

import com.property.model.HousingRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class HousingDatasetService {

    private static final int EXPECTED_COLUMN_COUNT = 9;

    private final Path datasetPath;
    private final List<HousingRecord> records;

    public HousingDatasetService(@Value("${dataset.path}") String datasetPath) {
        this.datasetPath = Path.of(datasetPath);
        this.records = loadRecords();
    }

    public List<HousingRecord> getRecords() {
        return records;
    }

    public Path getDatasetPath() {
        return datasetPath;
    }

    private List<HousingRecord> loadRecords() {
        if (!Files.isRegularFile(datasetPath)) {
            throw new IllegalStateException("Housing dataset not found: " + datasetPath.toAbsolutePath());
        }

        List<HousingRecord> loadedRecords = new ArrayList<>();
        try (BufferedReader reader = Files.newBufferedReader(datasetPath, StandardCharsets.UTF_8)) {
            String header = reader.readLine();
            if (header == null) {
                throw new IllegalStateException("Housing dataset is empty: " + datasetPath.toAbsolutePath());
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                loadedRecords.add(parseRecord(line, lineNumber));
            }
        } catch (IOException exception) {
            throw new IllegalStateException(
                "Failed to read housing dataset: " + datasetPath.toAbsolutePath(),
                exception
            );
        }

        if (loadedRecords.isEmpty()) {
            throw new IllegalStateException("Housing dataset contains no records: " + datasetPath.toAbsolutePath());
        }
        return List.copyOf(loadedRecords);
    }

    private HousingRecord parseRecord(String line, int lineNumber) {
        String[] columns = line.split(",", -1);
        if (columns.length != EXPECTED_COLUMN_COUNT) {
            throw new IllegalStateException(
                "Invalid housing dataset row at line " + lineNumber
                    + ": expected " + EXPECTED_COLUMN_COUNT + " columns but found " + columns.length
            );
        }

        try {
            return new HousingRecord(
                Long.parseLong(columns[0].trim()),
                Double.parseDouble(columns[1].trim()),
                Integer.parseInt(columns[2].trim()),
                Double.parseDouble(columns[3].trim()),
                Integer.parseInt(columns[4].trim()),
                Double.parseDouble(columns[5].trim()),
                Double.parseDouble(columns[6].trim()),
                Double.parseDouble(columns[7].trim()),
                Double.parseDouble(columns[8].trim())
            );
        } catch (NumberFormatException exception) {
            throw new IllegalStateException(
                "Invalid numeric value in housing dataset at line " + lineNumber,
                exception
            );
        }
    }
}
