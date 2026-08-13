import os
import httpx

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
TIMEOUT = 10.0


class MLServiceError(Exception):
    pass


async def predict_price(features: dict) -> float:
    url = f"{ML_SERVICE_URL}/predict"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(url, json=features)
            response.raise_for_status()
            data = response.json()
            return float(data["predictions"])
    except httpx.ConnectError as e:
        raise MLServiceError(f"Cannot connect to ML service: {e}")
    except httpx.TimeoutException as e:
        raise MLServiceError(f"ML service request timed out: {e}")
    except httpx.HTTPStatusError as e:
        raise MLServiceError(f"ML service returned error {e.response.status_code}: {e.response.text}")
    except Exception as e:
        raise MLServiceError(f"Unexpected error calling ML service: {e}")
