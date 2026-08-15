package com.property.model;

public record HousingRecord(
    long id,
    double squareFootage,
    int bedrooms,
    double bathrooms,
    int yearBuilt,
    double lotSize,
    double distanceToCityCenter,
    double schoolRating,
    double price
) {
}
