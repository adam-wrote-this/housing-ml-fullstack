"""提供模型加载、输入特征校验和特征排序工具。"""

import os
import joblib
from typing import Tuple, List, Dict, Any


def load_model() -> Tuple[Any, Dict[str, float], List[str]]:
    """加载模型产物，并返回模型、评估指标和固定特征顺序。"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "model.joblib")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found: {model_path}. "
            "Please run 'python train.py' to generate the model."
        )
    
    try:
        model_data = joblib.load(model_path)
        
        # 提供服务前校验持久化模型的数据契约。
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
    """校验输入字段与模型要求完全一致，拒绝缺失或额外字段。"""
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
    """按训练时保存的特征顺序，将字典转换为模型输入数组。"""
    validate_features(features, feature_names)
    return [features[name] for name in feature_names]
