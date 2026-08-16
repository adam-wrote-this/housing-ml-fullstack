"""App1 房源预测业务服务：校验前端请求并转发至 ML 服务。"""

from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import PropertyRequest, PredictionResult, HealthResponse
from client import predict_price, MLServiceError

app = FastAPI(
    title="App1 - Property Prediction Service",
    description="Business backend for house price prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    """返回 App1 自身运行状态，不级联检查 ML 服务。"""
    return HealthResponse(
        status="ok",
        service="app1-python",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/property/predict", response_model=PredictionResult)
async def property_predict(request: PropertyRequest):
    """接收房屋特征，调用 ML 服务并返回业务化的预测结果。"""
    features = request.model_dump()
    try:
        price = await predict_price(features)
    except MLServiceError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {e}")
    return PredictionResult(
        predicted_price=price,
        status="success",
        message="Price prediction successful",
    )
