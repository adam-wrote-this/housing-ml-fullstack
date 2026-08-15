package com.property.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

@Configuration
public class CacheConfig {

    public static final String MARKET_SEGMENTS = "marketSegments";
    public static final String MARKET_DASHBOARD = "marketDashboard";
    public static final String WHAT_IF_PREDICTIONS = "whatIfPredictions";

    @Bean
    public CacheManager cacheManager(
        @Value("${cache.maximum-size}") long maximumSize,
        @Value("${cache.expire-after-write}") Duration expireAfterWrite
    ) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(List.of(
            MARKET_SEGMENTS,
            MARKET_DASHBOARD,
            WHAT_IF_PREDICTIONS
        ));
        cacheManager.setCaffeine(Objects.requireNonNull(Caffeine.newBuilder()
            .maximumSize(maximumSize)
            .expireAfterWrite(expireAfterWrite)
            .recordStats()));
        cacheManager.setAllowNullValues(false);
        return cacheManager;
    }
}
