"""
Training script for housing price prediction model.
Reads the configured housing dataset, trains LinearRegression, and saves model.joblib.
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import numpy as np


def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.getenv(
        "DATASET_PATH",
        os.path.join(current_dir, "housing.csv"),
    )
    model_path = os.path.join(current_dir, "model.joblib")

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found: {data_path}")

    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)

    # Drop non-feature columns
    if "id" in df.columns:
        df = df.drop(columns=["id"])

    df = df.dropna()

    X = df.drop(columns=["price"])
    y = df["price"]

    feature_names = X.columns.tolist()
    print(f"Features: {feature_names}")
    print(f"Dataset shape: {X.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    mae = mean_absolute_error(y_test, y_pred)

    metrics = {
        "r2_score": float(r2),
        "mse": float(mse),
        "rmse": rmse,
        "mae": float(mae),
    }

    print(f"\nModel Metrics:")
    print(f"  R2 Score: {r2:.4f}")
    print(f"  RMSE:     {rmse:.4f}")
    print(f"  MSE:      {mse:.4f}")
    print(f"  MAE:      {mae:.4f}")

    model_data = {
        "model": model,
        "metrics": metrics,
        "feature_names": feature_names,
    }

    joblib.dump(model_data, model_path)
    print(f"\nModel saved to: {model_path}")


if __name__ == "__main__":
    train_model()
