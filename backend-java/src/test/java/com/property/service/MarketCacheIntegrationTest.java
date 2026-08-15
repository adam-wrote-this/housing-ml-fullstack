package com.property.service;

import com.property.dto.WhatIfRequestDto;
import com.property.dto.WhatIfResponseDto;
import com.property.dto.WhatIfOverridesDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Duration;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = {
    "dataset.path=src/test/resources/test-housing.csv",
    "cache.maximum-size=10",
    "cache.expire-after-write=1m"
})
class MarketCacheIntegrationTest {

    @Autowired
    private MarketService marketService;

    @Autowired
    private CacheManager cacheManager;

    @MockitoBean
    private MlClientService mlClientService;

    @BeforeEach
    void clearCaches() {
        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(Objects.requireNonNull(name));
            if (cache != null) {
                cache.clear();
            }
        });
    }

    @Test
    void cachesRepeatedWhatIfPredictionsForEqualRequests() {
        when(mlClientService.predictBatch(org.mockito.ArgumentMatchers.anyList()))
            .thenReturn(java.util.List.of(320000.0, 350000.0, 350000.0));
        WhatIfRequestDto request = request();

        WhatIfResponseDto first = marketService.whatIf(request);
        WhatIfResponseDto cached = marketService.whatIf(request());

        assertThat(cached).isSameAs(first);
        assertThat(cached.getScenarioPrediction()).isEqualTo(350000);
        assertThat(cached.getBaselinePrediction()).isEqualTo(320000);
        verify(mlClientService, times(1))
            .predictBatch(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void cachesDashboardResponse() {
        var first = marketService.getDashboard();
        var cached = marketService.getDashboard();

        assertThat(cached).isSameAs(first);
        assertThat(cached.getSummary().getTotalProperties()).isEqualTo(3);
    }

    @Test
    void configuresBoundedExpiringCaffeineCaches() {
        CaffeineCache cache = (CaffeineCache) Objects.requireNonNull(
            cacheManager.getCache("whatIfPredictions")
        );

        assertThat(cache.getNativeCache().policy().eviction())
            .hasValueSatisfying(policy -> assertThat(policy.getMaximum()).isEqualTo(10));
        assertThat(cache.getNativeCache().policy().expireAfterWrite())
            .hasValueSatisfying(policy ->
                assertThat(policy.getExpiresAfter()).isEqualTo(Duration.ofMinutes(1))
            );
    }

    private WhatIfRequestDto request() {
        return WhatIfRequestDto.builder()
            .propertyId(1L)
            .overrides(WhatIfOverridesDto.builder().squareFootage(1400.0).build())
            .build();
    }
}
