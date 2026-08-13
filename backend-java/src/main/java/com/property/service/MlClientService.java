package com.property.service;

import com.property.dto.HousingFeaturesDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MlClientService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public Double predict(HousingFeaturesDto features) {
        String url = mlServiceUrl + "/predict";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<HousingFeaturesDto> request = new HttpEntity<>(features, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Object predictions = response.getBody().get("predictions");
            return ((Number) predictions).doubleValue();
        } catch (RestClientException e) {
            throw new RuntimeException("ML service unavailable: " + e.getMessage(), e);
        }
    }
}
