# ML Housing Price Prediction Service

This is the core ML service for the housing price prediction system. It provides three REST API endpoints for model management and price predictions.

## Features

- **Linear Regression Model**: Trained on California housing dataset
- **Single & Batch Predictions**: Support for both individual and bulk price predictions
- **Model Introspection**: Access to model coefficients, intercept, and evaluation metrics
- **Health Monitoring**: Service status and model readiness checks
- **Async Processing**: Built with FastAPI for high performance
- **Auto-generated Docs**: Swagger UI available at `/docs`

## Prerequisites

- Python 3.10 or higher
- pip package manager

## Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

## Setup

### 1. Train the Model

```bash
python train.py
```

This will:
- Load `housing.csv` dataset
- Split data into 80% train, 20% test
- Train a LinearRegression model
- Calculate R², RMSE, MSE, MAE metrics
- Save model to `model.joblib`

### 2. Start the Service

**Option A: Run all steps at once (Windows)**
```batch
run.bat
```

**Option B: Manual start**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will start at `http://localhost:8000`

## API Endpoints

### 1. Health Check
```
GET /health
```

Returns service status and model loading state.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 2. Make Prediction(s)
```
POST /predict
```

Accepts either single or batch input.

**Single Prediction:**
```json
{
  "longitude": -122.25,
  "latitude": 37.85,
  "housing_median_age": 52.0,
  "total_rooms": 1820.0,
  "total_bedrooms": 300.0,
  "population": 806.0,
  "households": 270.0,
  "median_income": 3.1
}
```

**Batch Prediction:**
```json
[
  {"longitude": -122.25, "latitude": 37.85, ...},
  {"longitude": -122.40, "latitude": 37.86, ...}
]
```

**Response:**
```json
{
  "predictions": 206000.0,
  "status": "success",
  "message": "Single prediction completed"
}
```

or for batch:
```json
{
  "predictions": [206000.0, 215000.0],
  "status": "success",
  "message": "Batch prediction completed for 2 items"
}
```

### 3. Get Model Information
```
GET /model-info
```

Returns model coefficients, intercept, and evaluation metrics.

**Response:**
```json
{
  "coefficients": [0.456, -0.245, ...],
  "intercept": -36789.5,
  "feature_names": ["longitude", "latitude", "housing_median_age", ...],
  "metrics": {
    "r2_score": 0.5757,
    "mse": 73426.0,
    "rmse": 271.0,
    "mae": 134.5
  }
}
```

## Interactive Testing

Once the service is running, visit the Swagger UI for interactive API testing:

```
http://localhost:8000/docs
```

Features:
- Try out each endpoint directly in your browser
- See request/response schemas
- Download API documentation

## File Structure

```
ml-service/
├── requirements.txt      # Python dependencies
├── housing.csv          # Training dataset
├── schemas.py           # Pydantic data models
├── train.py            # Model training script
├── utils.py            # Utility functions (loading, validation)
├── main.py             # FastAPI application
├── model.joblib        # Trained model (auto-generated)
├── run.bat             # Windows batch runner
└── README.md           # This file
```

## Model Details

- **Algorithm**: LinearRegression (scikit-learn)
- **Training Data**: California housing dataset (20,640 samples)
- **Features**: 8 (longitude, latitude, housing_median_age, total_rooms, total_bedrooms, population, households, median_income)
- **Target**: median_house_value

## Environment Variables

Currently all file paths use relative paths. For Docker deployments:
- Set `ML_SERVICE_PORT` to override default port (8000)
- Set `ML_SERVICE_HOST` to override default host (0.0.0.0)

## Error Handling

All errors return JSON responses with descriptive messages:

- **400/422**: Invalid input (missing or malformed features)
- **500**: Internal server error (model loading, prediction failure)
- **503**: Model not loaded

Example error response:
```json
{
  "detail": "Invalid input: Missing features: {'total_bedrooms'}"
}
```

## Development

### Adding Features

The service is modular by design:
1. Update `schemas.py` for new input/output formats
2. Modify `train.py` for model changes
3. Update `main.py` endpoints as needed
4. Re-run `train.py` to generate new model

### Performance Considerations

- Single predictions: ~5ms latency
- Batch predictions: ~0.5ms per item
- Model loading: One-time on startup
- No model caching issues (stateless requests)

## Troubleshooting

### Model not loading
```
Error: Model file not found: ./model.joblib. 
Please run 'python train.py' to generate the model.
```

**Solution**: Run `python train.py` first

### Missing features in prediction
```
Invalid input: Missing features: {'total_bedrooms'}
```

**Solution**: Ensure all 8 features are provided in the request

### Port already in use
```
OSError: Address already in use
```

**Solution**: Change port or kill existing process:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

## License

Part of housing-ml-fullstack project
