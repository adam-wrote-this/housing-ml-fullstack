"""
Pydantic schemas for housing price prediction service.
Supports both single object and batch array input formats.
Column names match housing.csv: square_footage, bedrooms, bathrooms,
year_built, lot_size, distance_to_city_center, school_rating
"""

from typing import List, Union
from pydantic import BaseModel, Field, ConfigDict


class HousingFeatures(BaseModel):
    """Schema for a single housing feature object."""
    square_footage: float = Field(..., description="Total square footage of the house")
    bedrooms: float = Field(..., description="Number of bedrooms")
    bathrooms: float = Field(..., description="Number of bathrooms")
    year_built: float = Field(..., description="Year the house was built")
    lot_size: float = Field(..., description="Lot size in square feet")
    distance_to_city_center: float = Field(..., description="Distance to city center in miles")
    school_rating: float = Field(..., description="School rating (1-10)")

    class Config:
        json_schema_extra = {
            "example": {
                "square_footage": 1850,
                "bedrooms": 3,
                "bathrooms": 2,
                "year_built": 1998,
                "lot_size": 7500,
                "distance_to_city_center": 5.6,
                "school_rating": 8.2
            }
        }


class PredictionResponse(BaseModel):
    """Schema for prediction response."""
    predictions: Union[float, List[float]] = Field(..., description="Predicted house price(s)")
    status: str = Field(default="success", description="Status of prediction")
    message: str = Field(default="", description="Optional message")


class ModelInfoResponse(BaseModel):
    """Schema for model information response."""
    coefficients: List[float] = Field(..., description="Model coefficients for each feature")
    intercept: float = Field(..., description="Model intercept value")
    feature_names: List[str] = Field(..., description="Names of input features")
    metrics: dict = Field(..., description="Model evaluation metrics (R2, RMSE, MSE, MAE)")


class HealthResponse(BaseModel):
    """Schema for health check response."""
    model_config = ConfigDict(protected_namespaces=())
    status: str = Field(..., description="Service status (ok/error)")
    model_loaded: bool = Field(..., description="Whether the model is loaded")
    version: str = Field(default="1.0.0", description="Service version")
    timestamp: str = Field(..., description="Current timestamp")
