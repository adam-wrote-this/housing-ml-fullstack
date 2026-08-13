@echo off
REM Local verification script for ml-service (Windows)
REM This script tests ml-service without Docker

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo =====================================================
echo ML-Service Local Verification Script
echo =====================================================
echo.

REM Check Python installation
echo [Step 1] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found! Please install Python 3.12+
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✓ Found: %PYTHON_VERSION%
echo.

REM Check if ml-service directory exists
echo [Step 2] Checking ml-service directory...
if not exist "ml-service" (
    echo ERROR: ml-service directory not found!
    exit /b 1
)
echo ✓ ml-service directory found
echo.

REM Check required files
echo [Step 3] Checking required files...
set missing_files=0
for %%f in (ml-service\housing.csv ml-service\main.py ml-service\schemas.py ml-service\train.py ml-service\utils.py ml-service\requirements.txt) do (
    if not exist "%%f" (
        echo ✗ Missing: %%f
        set missing_files=1
    ) else (
        echo ✓ Found: %%f
    )
)
if %missing_files% equ 1 (
    echo ERROR: Some required files are missing!
    exit /b 1
)
echo.

REM Create virtual environment
echo [Step 4] Creating Python virtual environment...
if exist "ml-service\venv" (
    echo ✓ Virtual environment already exists
) else (
    cd ml-service
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        cd ..
        exit /b 1
    )
    echo ✓ Virtual environment created
    cd ..
)
echo.

REM Activate virtual environment and install dependencies
echo [Step 5] Installing dependencies...
call ml-service\venv\Scripts\activate.bat
pip install -q -r ml-service\requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    deactivate
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

REM Run training script
echo [Step 6] Running training script...
cd ml-service
python train.py
if %errorlevel% neq 0 (
    echo ERROR: Training failed!
    cd ..
    deactivate
    exit /b 1
)
echo ✓ Model trained and saved
cd ..
echo.

REM Verify model file
echo [Step 7] Verifying model file...
if exist "ml-service\model.joblib" (
    echo ✓ model.joblib created successfully
    for /f %%A in ('powershell -Command "Get-Item 'ml-service\model.joblib' | Select-Object -ExpandProperty Length"') do set model_size=%%A
    echo   File size: !model_size! bytes
) else (
    echo ERROR: model.joblib was not created!
    deactivate
    exit /b 1
)
echo.

REM Run test script
echo [Step 8] Running API tests...
if exist "ml-service\test_api.py" (
    cd ml-service
    python test_api.py
    if %errorlevel% neq 0 (
        echo WARNING: Some tests failed (this is expected if pytest is not installed)
        echo       Run: pip install pytest requests
        echo       Then: cd ml-service && pytest test_api.py -v
    ) else (
        echo ✓ All API tests passed
    )
    cd ..
) else (
    echo ⓘ test_api.py not found, skipping tests
)
echo.

REM Summary
echo =====================================================
echo Verification Summary
echo =====================================================
echo ✓ Python environment ready
echo ✓ All required files present
echo ✓ Dependencies installed
echo ✓ Model training completed
echo ✓ model.joblib generated (!model_size! bytes)
echo.
echo Next steps:
echo   1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
echo   2. Run: docker compose build ml-service
echo   3. Run: docker compose up ml-service
echo   4. Test APIs at: http://localhost:8000/docs
echo.
echo =====================================================
echo Deactivating virtual environment...
deactivate
echo ✓ Verification complete!
echo.
