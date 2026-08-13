#!/bin/bash
# Script to test Housing Price Prediction Service
# Prerequisites: Python 3.10+, pip

set -e

cd "$(dirname "$0")"

echo "========================================"
echo "Housing Price ML Service - Setup & Test"
echo "========================================"
echo ""

# Install dependencies
echo "[Step 1/3] Installing dependencies..."
python3 -m pip install -q -r requirements.txt
echo "✓ Dependencies installed successfully."
echo ""

# Train model
echo "[Step 2/3] Training model..."
python3 train.py
echo ""

# Start service
echo "[Step 3/3] Starting FastAPI service..."
echo ""
echo "Swagger UI will be available at: http://localhost:8000/docs"
echo "Press Ctrl+C to stop the service"
echo ""
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
