"""
Utility functions for model loading and metric calculations.
"""

import os
import joblib
from typing import Tuple, List, Dict, Any


def load_model() -> Tuple[Any, Dict[str, float], List[str]]:
    """
    Load trained model from model.joblib.
    
    Returns:
        Tuple of (model, metrics dict, feature names list)
        
    Raises:
        FileNotFoundError: If model.joblib doesn't exist
        ValueError: If model data is corrupted
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "model.joblib")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found: {model_path}. "
            "Please run 'python train.py' to generate the model."
        )
    
    try:
        model_data = joblib.load(model_path)
        
        # Validate model data structure
        required_keys = {"model", "metrics", "feature_names"}
        if not all(key in model_data for key in required_keys):
            raise ValueError(
                f"Model data missing required keys. Expected: {required_keys}, "
                f"Got: {set(model_data.keys())}"
            )
        
        model = model_data["model"]
        metrics = model_data["metrics"]
        feature_names = model_data["feature_names"]
        
        return model, metrics, feature_names
        
    except Exception as e:
        raise ValueError(f"Failed to load model: {str(e)}")


def validate_features(features: dict, feature_names: List[str]) -> bool:
    """
    Validate that input features match expected feature names.
    
    Args:
        features: Input feature dictionary
        feature_names: Expected feature names from model
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If features don't match expected names
    """
    input_keys = set(features.keys())
    expected_keys = set(feature_names)
    
    if input_keys != expected_keys:
        missing = expected_keys - input_keys
        extra = input_keys - expected_keys
        error_msg = []
        if missing:
            error_msg.append(f"Missing features: {missing}")
        if extra:
            error_msg.append(f"Extra features: {extra}")
        raise ValueError("; ".join(error_msg))
    
    return True


def prepare_features_array(features: dict, feature_names: List[str]) -> list:
    """
    Convert feature dict to ordered array matching model's feature order.
    
    Args:
        features: Input feature dictionary
        feature_names: Expected feature names and their order
        
    Returns:
        Ordered list of feature values
    """
    validate_features(features, feature_names)
    return [features[name] for name in feature_names]
