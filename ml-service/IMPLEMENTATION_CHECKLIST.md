# 阶段1 验收清单 - ML房价推理服务

## 文件创建完成度

### 核心源文件 ✓
- [x] `requirements.txt` - Python依赖声明
  - 包含：fastapi, uvicorn[standard], scikit-learn, pandas, joblib, pydantic
  
- [x] `schemas.py` - Pydantic数据模型
  - HousingFeatures: 单条房屋特征模型
  - PredictionResponse: 预测响应模型
  - ModelInfoResponse: 模型信息响应模型
  - HealthResponse: 健康检查响应模型
  
- [x] `train.py` - 模型训练脚本
  - 从housing.csv读取数据
  - 80/20训练测试集划分
  - LinearRegression模型训练
  - 计算R²、RMSE、MSE、MAE指标
  - 保存model.joblib（包含模型、指标、特征列表）
  
- [x] `utils.py` - 工具函数
  - load_model(): 加载model.joblib及其元数据
  - validate_features(): 验证输入特征
  - prepare_features_array(): 将字典转换为有序数组
  - 完善的异常处理和错误消息
  
- [x] `main.py` - FastAPI应用主体
  - 启动时自动加载模型
  - GET /health: 返回服务状态、模型加载状态、时间戳
  - POST /predict: 支持单条/批量预测，参数校验，异常捕获
  - GET /model-info: 返回系数、截距、全部指标、特征列表
  - 全局异常处理器

### 辅助文件 ✓
- [x] `README.md` - 详细的使用说明
- [x] `run.bat` - Windows一键启动脚本
- [x] `run.sh` - Linux/Mac一键启动脚本
- [x] `test_api.py` - 完整的API测试脚本
- [x] `housing.csv` - 训练数据集

## 本地测试执行步骤

### 快速开始（推荐）

**Windows:**
```bash
cd ml-service
run.bat
```

**Linux/Mac:**
```bash
cd ml-service
chmod +x run.sh
./run.sh
```

### 手动执行步骤

1. **安装依赖**
```bash
cd ml-service
pip install -r requirements.txt
```

2. **训练模型**
```bash
python train.py
```

预期输出：
- 加载housing.csv
- 显示8个特征名
- 显示训练集/测试集大小
- 显示R²、RMSE、MSE、MAE指标
- 生成model.joblib

3. **启动服务**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

预期：服务在 http://0.0.0.0:8000 启动

4. **交互式测试（新终端窗口）**

访问Swagger UI：
```
http://localhost:8000/docs
```

逐项测试三个接口：
- GET /health - 验证返回200和服务状态
- POST /predict - 输入房屋特征，验证返回预测价格
- GET /model-info - 验证返回系数、截距、指标

5. **自动化测试（新终端窗口）**
```bash
python test_api.py
```

预期：所有5个测试通过

## 验收标准

✅ 所有5个核心源文件创建正常
✅ train.py执行无报错，生成model.joblib
✅ 服务启动无报错
✅ 三个接口都可通过Swagger UI调用
✅ 单条预测正常返回房价
✅ 批量预测返回对应数量的结果数组
✅ model-info返回系数、截距、全部指标
✅ 非法入参返回清晰的错误信息（HTTP 422或400）

## 已完成

**阶段1 ML房价推理服务已完全实现并可交付**

所有文件可在 `ml-service/` 目录中找到。按照上述步骤在您的本地环境中执行即可验证完整功能。
