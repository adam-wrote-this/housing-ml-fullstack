"""
FastAPI application for housing price prediction service.
Provides three main endpoints:
  - GET /health: Health check
  - POST /predict: Single or batch predictions
  - GET /model-info: Model information and metrics
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Union, List
import logging

from schemas import (
    HousingFeatures,
    PredictionResponse,
    ModelInfoResponse,
    HealthResponse,
)
from utils import load_model, validate_features, prepare_features_array


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Housing Price Prediction Service",
    description="ML service for predicting house prices using Linear Regression",
    version="1.0.0",
)

# Global model state
model = None
metrics = None
feature_names = None
model_load_error = None


@app.on_event("startup")
async def load_model_on_startup():
    """Load model when application starts."""
    global model, metrics, feature_names, model_load_error
    try:
        model, metrics, feature_names = load_model()
        logger.info(
            f"✓ Model loaded successfully. Features: {feature_names}"
        )
    except Exception as e:
        error_msg = str(e)
        model_load_error = error_msg
        logger.error(f"✗ Failed to load model: {error_msg}")


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    Returns service status and model loading state.
    """
    return HealthResponse(
        status="ok" if model is not None else "error",
        model_loaded=model is not None,
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    data: Union[HousingFeatures, List[HousingFeatures]]
) -> PredictionResponse:
    """
    Predict house price(s).
    
    Accepts either:
    - Single feature object: returns single prediction
    - Array of feature objects: returns array of predictions
    
    Args:
        data: Housing features (single or batch)
        
    Returns:
        PredictionResponse with predictions and status
        
    Raises:
        HTTPException 500: If model is not loaded
        HTTPException 422: If input validation fails
    """
    try:
        # Check model is loaded
        if model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model not loaded: {model_load_error}",
            )
        
        # Handle single vs batch input
        if isinstance(data, HousingFeatures):
            # Single prediction
            features_dict = data.model_dump()
            features_array = prepare_features_array(features_dict, feature_names)
            prediction = float(model.predict([features_array])[0])
            
            return PredictionResponse(
                predictions=prediction,
                status="success",
                message="Single prediction completed",
            )
        
        elif isinstance(data, list):
            # Batch predictions
            if not data:
                raise ValueError("Batch array cannot be empty")
            
            predictions = []
            for item in data:
                features_dict = item.model_dump()
                features_array = prepare_features_array(
                    features_dict, feature_names
                )
                pred = float(model.predict([features_array])[0])
                predictions.append(pred)
            
            return PredictionResponse(
                predictions=predictions,
                status="success",
                message=f"Batch prediction completed for {len(predictions)} items",
            )
        
        else:
            raise ValueError("Invalid input format")
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid input: {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )


@app.get("/model-info", response_model=ModelInfoResponse)
async def model_info() -> ModelInfoResponse:
    """
    Get model information including coefficients, intercept, and metrics.
    
    Returns:
        ModelInfoResponse with full model details
        
    Raises:
        HTTPException 503: If model is not loaded
    """
    try:
        if model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model not loaded: {model_load_error}",
            )
        
        return ModelInfoResponse(
            coefficients=model.coef_.tolist(),
            intercept=float(model.intercept_),
            feature_names=feature_names,
            metrics=metrics,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model info error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}",
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "status": "error",
        },
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
