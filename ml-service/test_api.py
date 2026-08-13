"""
Test script for Housing Price Prediction API.
Tests all three endpoints with various scenarios.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

SAMPLE_HOUSE = {
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2
}

def print_test(title, success, details=""):
    status = "PASS" if success else "FAIL"
    print(f"[{status}] {title}")
    if details:
        print(f"       {details}")


def test_health():
    print("\n--- GET /health ---")
    resp = requests.get(f"{BASE_URL}/health")
    data = resp.json()
    ok = resp.status_code == 200 and data.get("status") in ["ok", "error"]
    print_test("Health check", ok, str(data))
    return ok


def test_single_predict():
    print("\n--- POST /predict (single) ---")
    resp = requests.post(f"{BASE_URL}/predict", json=SAMPLE_HOUSE)
    data = resp.json()
    ok = resp.status_code == 200 and isinstance(data.get("predictions"), (int, float))
    print_test("Single prediction", ok, f"predictions={data.get('predictions')}")
    return ok


def test_batch_predict():
    print("\n--- POST /predict (batch) ---")
    payload = [SAMPLE_HOUSE, {**SAMPLE_HOUSE, "square_footage": 2100, "bedrooms": 4}]
    resp = requests.post(f"{BASE_URL}/predict", json=payload)
    data = resp.json()
    ok = resp.status_code == 200 and isinstance(data.get("predictions"), list) and len(data["predictions"]) == 2
    print_test("Batch prediction", ok, f"predictions={data.get('predictions')}")
    return ok


def test_model_info():
    print("\n--- GET /model-info ---")
    resp = requests.get(f"{BASE_URL}/model-info")
    data = resp.json()
    ok = (resp.status_code == 200 and
          "coefficients" in data and
          "intercept" in data and
          "metrics" in data and
          "feature_names" in data)
    print_test("Model info", ok, f"features={data.get('feature_names')}, metrics={data.get('metrics')}")
    return ok


def test_invalid_input():
    print("\n--- POST /predict (invalid) ---")
    resp = requests.post(f"{BASE_URL}/predict", json={"invalid_field": 999})
    ok = resp.status_code in [400, 422]
    print_test("Invalid input rejected", ok, f"status_code={resp.status_code}")
    return ok


if __name__ == "__main__":
    results = [
        test_health(),
        test_single_predict(),
        test_batch_predict(),
        test_model_info(),
        test_invalid_input(),
    ]
    passed = sum(results)
    total = len(results)
    print(f"\n=============================")
    print(f"Total: {passed}/{total} tests passed {'OK' if passed == total else 'FAIL'}")
    print(f"=============================")
