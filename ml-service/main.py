"""ML 推理服务：加载线性回归模型并提供健康、预测和模型信息接口。"""

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


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Housing Price Prediction Service",
    description="ML service for predicting house prices using Linear Regression",
    version="1.0.0",
)

model = None
metrics = None
feature_names = None
model_load_error = None


@app.on_event("startup")
async def load_model_on_startup():
    """服务启动时加载模型、评估指标和固定特征顺序。"""
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
    """返回服务状态和模型是否已成功加载。"""
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
    """接收单条对象或批量数组，并返回数量和顺序对应的预测价格。"""
    try:
        if model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model not loaded: {model_load_error}",
            )
        
        # 单条与批量客户端共用同一个端点。
        if isinstance(data, HousingFeatures):
            features_dict = data.model_dump()
            features_array = prepare_features_array(features_dict, feature_names)
            prediction = float(model.predict([features_array])[0])
            
            return PredictionResponse(
                predictions=prediction,
                status="success",
                message="Single prediction completed",
            )
        
        elif isinstance(data, list):
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
    """返回模型系数、截距、特征顺序和离线评估指标。"""
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
    """捕获未处理异常并返回统一的 500 JSON 响应。"""
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
