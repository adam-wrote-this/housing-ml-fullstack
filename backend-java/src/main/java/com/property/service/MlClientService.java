package com.property.service;

import com.property.dto.HousingFeaturesDto;
import com.property.dto.MlPredictionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

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
            ResponseEntity<MlPredictionResponseDto> response = restTemplate.postForEntity(
                url,
                request,
                MlPredictionResponseDto.class
            );
            MlPredictionResponseDto body = response.getBody();
            if (body == null || body.getPredictions() == null) {
                throw new IllegalStateException("ML service returned an empty prediction");
            }
            return body.getPredictions();
        } catch (RestClientException e) {
            throw new RuntimeException("ML service unavailable: " + e.getMessage(), e);
        }
    }
}
