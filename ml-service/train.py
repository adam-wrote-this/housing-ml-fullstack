"""
Training script for housing price prediction model.
Reads housing.csv, trains LinearRegression model, and saves to model.joblib.
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import numpy as np


def train_model():
    """
    Train linear regression model on housing data.
    Saves model.joblib containing: model, metrics, and feature names.
    """
    # Get the current directory (ml-service)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "housing.csv")
    model_path = os.path.join(current_dir, "model.joblib")
    
    # Check if data file exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found: {data_path}")
    
    print(f"Loading data from: {data_path}")
    # Load data
    df = pd.read_csv(data_path)
    
    # Handle missing values if any
    df = df.dropna()
    
    # Separate features and target
    X = df.drop(columns=['median_house_value'])
    y = df['median_house_value']
    
    feature_names = X.columns.tolist()
    print(f"Features: {feature_names}")
    print(f"Dataset shape: {X.shape}")
    
    # Split data: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Train model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    
    metrics = {
        "r2_score": float(r2),
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
    }
    
    print(f"\nModel Metrics:")
    print(f"  R² Score: {r2:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MSE: {mse:.4f}")
    print(f"  MAE: {mae:.4f}")
    
    # Save model with metadata
    model_data = {
        "model": model,
        "metrics": metrics,
        "feature_names": feature_names,
    }
    
    joblib.dump(model_data, model_path)
    print(f"\nModel saved to: {model_path}")


if __name__ == "__main__":
    train_model()
