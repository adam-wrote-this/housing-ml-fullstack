"""
Test script for Housing Price Prediction API.
Tests all three endpoints with various scenarios.
"""

import requests
import json
from typing import Dict, Any


BASE_URL = "http://localhost:8000"


def print_test(title: str, success: bool, details: str = ""):
    """Print test result."""
    status = "✓ PASS" if success else "✗ FAIL"
    print(f"{status}: {title}")
    if details:
        print(f"       {details}")


def test_health() -> bool:
    """Test GET /health endpoint."""
    print("\n--- Testing GET /health ---")
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        
        success = (
            response.status_code == 200 and
            data.get("status") in ["ok", "error"] and
            isinstance(data.get("model_loaded"), bool) and
            data.get("version") and
            data.get("timestamp")
        )
        
        print_test(
            "Health check endpoint",
            success,
            f"Status: {data.get('status')}, Model loaded: {data.get('model_loaded')}"
        )
        return success
    except Exception as e:
        print_test("Health check endpoint", False, str(e))
        return False


def test_single_prediction() -> bool:
    """Test POST /predict with single object."""
    print("\n--- Testing POST /predict (Single) ---")
    try:
        payload = {
            "longitude": -122.25,
            "latitude": 37.85,
            "housing_median_age": 52.0,
            "total_rooms": 1820.0,
            "total_bedrooms": 300.0,
            "population": 806.0,
            "households": 270.0,
            "median_income": 3.1,
        }
        
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        data = response.json()
        
        success = (
            response.status_code == 200 and
            isinstance(data.get("predictions"), (int, float)) and
            data.get("status") == "success"
        )
        
        prediction = data.get("predictions", "N/A")
        print_test(
            "Single prediction",
            success,
            f"Predicted price: ${prediction:,.2f}" if isinstance(prediction, (int, float)) else f"Predicted price: {prediction}"
        )
        return success
    except Exception as e:
        print_test("Single prediction", False, str(e))
        return False


def test_batch_prediction() -> bool:
    """Test POST /predict with batch array."""
    print("\n--- Testing POST /predict (Batch) ---")
    try:
        payload = [
            {
                "longitude": -122.25,
                "latitude": 37.85,
                "housing_median_age": 52.0,
                "total_rooms": 1820.0,
                "total_bedrooms": 300.0,
                "population": 806.0,
                "households": 270.0,
                "median_income": 3.1,
            },
            {
                "longitude": -122.40,
                "latitude": 37.95,
                "housing_median_age": 30.0,
                "total_rooms": 2500.0,
                "total_bedrooms": 400.0,
                "population": 1200.0,
                "households": 350.0,
                "median_income": 4.5,
            },
        ]
        
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        data = response.json()
        
        success = (
            response.status_code == 200 and
            isinstance(data.get("predictions"), list) and
            len(data.get("predictions", [])) == 2 and
            data.get("status") == "success"
        )
        
        if success:
            predictions = data.get("predictions", [])
            details = f"Predictions: {[f'${p:,.2f}' if isinstance(p, (int, float)) else p for p in predictions]}"
        else:
            details = "Response format mismatch"
        
        print_test("Batch prediction (2 items)", success, details)
        return success
    except Exception as e:
        print_test("Batch prediction", False, str(e))
        return False


def test_model_info() -> bool:
    """Test GET /model-info endpoint."""
    print("\n--- Testing GET /model-info ---")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        data = response.json()
        
        success = (
            response.status_code == 200 and
            isinstance(data.get("coefficients"), list) and
            len(data.get("coefficients", [])) > 0 and
            isinstance(data.get("intercept"), (int, float)) and
            isinstance(data.get("feature_names"), list) and
            isinstance(data.get("metrics"), dict) and
            all(key in data["metrics"] for key in ["r2_score", "mse", "rmse", "mae"])
        )
        
        if success:
            metrics = data.get("metrics", {})
            details = (
                f"Features: {len(data.get('feature_names', []))}, "
                f"R²: {metrics.get('r2_score', 'N/A'):.4f}, "
                f"RMSE: {metrics.get('rmse', 'N/A'):.2f}"
            )
        else:
            details = "Response format mismatch"
        
        print_test("Model info endpoint", success, details)
        return success
    except Exception as e:
        print_test("Model info endpoint", False, str(e))
        return False


def test_invalid_input() -> bool:
    """Test error handling with invalid input."""
    print("\n--- Testing Error Handling ---")
    try:
        # Missing required field
        payload = {
            "longitude": -122.25,
            # Missing other fields
        }
        
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        
        success = response.status_code in [422, 400]
        
        error_msg = "Expected 422/400, got " + str(response.status_code)
        if not success:
            error_msg += f" - {response.text[:100]}"
        
        print_test("Invalid input handling", success, error_msg)
        return success
    except Exception as e:
        print_test("Invalid input handling", False, str(e))
        return False


def main():
    """Run all tests."""
    print("=" * 50)
    print("Housing Price Prediction API - Test Suite")
    print("=" * 50)
    print(f"Testing against: {BASE_URL}")
    print()
    
    # Check if service is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        print("✗ ERROR: Cannot connect to service at", BASE_URL)
        print("  Make sure the service is running:")
        print("    python -m uvicorn main:app --port 8000")
        return False
    except Exception as e:
        print(f"✗ ERROR: Connection failed - {e}")
        return False
    
    # Run tests
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Single Prediction", test_single_prediction()))
    results.append(("Batch Prediction", test_batch_prediction()))
    results.append(("Model Info", test_model_info()))
    results.append(("Error Handling", test_invalid_input()))
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓" if result else "✗"
        print(f"{status} {test_name}")
    
    print("-" * 50)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! API is working correctly.")
        return True
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please check the service.")
        return False


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
