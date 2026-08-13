@echo off
REM Script to test Housing Price Prediction Service
REM Prerequisites: Python 3.10+, pip

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Housing Price ML Service - Setup & Test
echo ========================================
echo.

REM Install dependencies
echo [Step 1/3] Installing dependencies...
python -m pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)
echo Dependencies installed successfully.
echo.

REM Train model
echo [Step 2/3] Training model...
python train.py
if %errorlevel% neq 0 (
    echo Error: Failed to train model
    exit /b 1
)
echo Model trained successfully.
echo.

REM Start service
echo [Step 3/3] Starting FastAPI service...
echo.
echo Swagger UI will be available at: http://localhost:8000/docs
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

endlocal
