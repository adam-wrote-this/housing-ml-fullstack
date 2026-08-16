"""封装 App1 到 ML 服务的异步 HTTP 调用和异常转换。"""

import os
import httpx

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
TIMEOUT = 10.0


class MLServiceError(Exception):
    """表示 ML 服务连接、超时、协议或响应异常。"""

    pass


async def predict_price(features: dict) -> float:
    """异步发送单条房屋特征，并提取预测价格。"""
    url = f"{ML_SERVICE_URL}/predict"
    try:
        # 等待网络 I/O 时不阻塞事件循环。
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(url, json=features)
            response.raise_for_status()
            data = response.json()
            return float(data["predictions"])
    # 将上游故障统一转换为业务异常。
    except httpx.ConnectError as e:
        raise MLServiceError(f"Cannot connect to ML service: {e}")
    except httpx.TimeoutException as e:
        raise MLServiceError(f"ML service request timed out: {e}")
    except httpx.HTTPStatusError as e:
        raise MLServiceError(f"ML service returned error {e.response.status_code}: {e.response.text}")
    except Exception as e:
        raise MLServiceError(f"Unexpected error calling ML service: {e}")
