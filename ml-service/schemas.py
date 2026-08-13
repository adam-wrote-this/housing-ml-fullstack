"""
Pydantic schemas for housing price prediction service.
Supports both single object and batch array input formats.
"""

from typing import List, Union
from pydantic import BaseModel, Field


class HousingFeatures(BaseModel):
    """Schema for single housing feature object."""
    longitude: float = Field(..., description="Longitude coordinate")
    latitude: float = Field(..., description="Latitude coordinate")
    housing_median_age: float = Field(..., description="Housing median age in years")
    total_rooms: float = Field(..., description="Total number of rooms")
    total_bedrooms: float = Field(..., description="Total number of bedrooms")
    population: float = Field(..., description="Population count")
    households: float = Field(..., description="Number of households")
    median_income: float = Field(..., description="Median income")

    class Config:
        json_schema_extra = {
            "example": {
                "longitude": -122.25,
                "latitude": 37.85,
                "housing_median_age": 52.0,
                "total_rooms": 1820.0,
                "total_bedrooms": 300.0,
                "population": 806.0,
                "households": 270.0,
                "median_income": 3.1,
            }
        }


class PredictionResponse(BaseModel):
    """Schema for prediction response."""
    predictions: Union[float, List[float]] = Field(..., description="Predicted house price(s)")
    status: str = Field(default="success", description="Status of prediction")
    message: str = Field(default="", description="Optional message or error details")


class ModelInfoResponse(BaseModel):
    """Schema for model information response."""
    coefficients: List[float] = Field(..., description="Model coefficients for each feature")
    intercept: float = Field(..., description="Model intercept value")
    feature_names: List[str] = Field(..., description="Names of input features")
    metrics: dict = Field(..., description="Model evaluation metrics (R2, RMSE, MSE, MAE)")


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = Field(..., description="Service status (ok/error)")
    model_loaded: bool = Field(..., description="Whether the model is loaded")
    version: str = Field(default="1.0.0", description="Service version")
    timestamp: str = Field(..., description="Current timestamp")
