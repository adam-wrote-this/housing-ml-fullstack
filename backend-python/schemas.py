from pydantic import BaseModel, Field
from datetime import datetime


class PropertyRequest(BaseModel):
    square_footage: float = Field(..., description="Total square footage of the property", example=1850.0)
    bedrooms: float = Field(..., description="Number of bedrooms", example=3.0)
    bathrooms: float = Field(..., description="Number of bathrooms", example=2.0)
    year_built: float = Field(..., description="Year the property was built", example=1998.0)
    lot_size: float = Field(..., description="Lot size in square feet", example=7500.0)
    distance_to_city_center: float = Field(..., description="Distance to city center in miles", example=5.6)
    school_rating: float = Field(..., description="Local school rating (1-10)", example=8.2)


class PredictionResult(BaseModel):
    predicted_price: float = Field(..., description="Predicted house price in USD")
    status: str = Field(..., description="Status of the prediction")
    message: str = Field(..., description="Human-readable message")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
