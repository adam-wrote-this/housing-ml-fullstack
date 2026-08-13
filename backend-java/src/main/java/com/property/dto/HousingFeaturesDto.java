package com.property.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HousingFeaturesDto {
    @JsonProperty("square_footage")
    private Double squareFootage;
    @JsonProperty("bedrooms")
    private Double bedrooms;
    @JsonProperty("bathrooms")
    private Double bathrooms;
    @JsonProperty("year_built")
    private Double yearBuilt;
    @JsonProperty("lot_size")
    private Double lotSize;
    @JsonProperty("distance_to_city_center")
    private Double distanceToCityCenter;
    @JsonProperty("school_rating")
    private Double schoolRating;
}
