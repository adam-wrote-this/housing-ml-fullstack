package com.property.service;

import com.property.dto.HousingFeaturesDto;
import com.property.dto.MlPredictionResponseDto;
import com.property.dto.MlBatchPredictionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.TimeoutException;

/** 使用 WebClient 以非阻塞方式调用 ML 预测接口。 */
@Service
@RequiredArgsConstructor
public class MlClientService {

    private final WebClient mlWebClient;

    /** 发送单条房屋特征并返回预测价格。 */
    public Mono<Double> predict(HousingFeaturesDto features) {
        // 保持 HTTP 调用惰性且非阻塞，由 Spring 在控制器边界订阅。
        return mlWebClient.post()
            .uri("/predict")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(features)
            .retrieve()
            .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                .defaultIfEmpty("No response body")
                .flatMap(body -> Mono.error(new RuntimeException(
                    "ML service returned error " + response.statusCode().value() + ": " + body
                ))))
            .bodyToMono(MlPredictionResponseDto.class)
            .switchIfEmpty(Mono.error(new IllegalStateException(
                "ML service returned an empty response"
            )))
            .map(response -> {
                if (response.getPredictions() == null) {
                    throw new IllegalStateException("ML service returned an empty prediction");
                }
                return response.getPredictions();
            })
            .onErrorMap(WebClientRequestException.class, exception ->
                new RuntimeException("ML service unavailable: " + exception.getMessage(), exception)
            )
            .onErrorMap(TimeoutException.class, exception ->
                new RuntimeException("ML service request timed out", exception)
            );
    }

    /** 批量发送房屋特征，并保持响应结果与输入位置一一对应。 */
    public Mono<List<Double>> predictBatch(List<HousingFeaturesDto> features) {
        // 结果数量必须与输入一致，因为业务依赖位置对应关系。
        return mlWebClient.post()
            .uri("/predict")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(features)
            .retrieve()
            .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                .defaultIfEmpty("No response body")
                .flatMap(body -> Mono.error(new RuntimeException(
                    "ML service returned error " + response.statusCode().value() + ": " + body
                ))))
            .bodyToMono(MlBatchPredictionResponseDto.class)
            .switchIfEmpty(Mono.error(new IllegalStateException(
                "ML service returned an empty response"
            )))
            .map(response -> {
                List<Double> predictions = response.getPredictions();
                if (predictions == null || predictions.size() != features.size()) {
                    throw new IllegalStateException("ML service returned an invalid batch prediction");
                }
                return predictions;
            })
            .onErrorMap(WebClientRequestException.class, exception ->
                new RuntimeException("ML service unavailable: " + exception.getMessage(), exception)
            )
            .onErrorMap(TimeoutException.class, exception ->
                new RuntimeException("ML service request timed out", exception)
            );
    }
}
