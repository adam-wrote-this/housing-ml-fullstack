# 阶段1 快速参考指南

## 🎯 任务完成情况

**✅ 阶段1 ML房价推理服务 - 已100%完成**

所有5个核心源文件已创建，通过所有验收标准。

---

## 📦 核心文件说明

### 1️⃣ requirements.txt
- **位置**: ml-service/
- **内容**: 6个Python包的版本声明
- **用途**: pip自动安装所有依赖
- **关键包**: FastAPI, scikit-learn, pandas, joblib

### 2️⃣ schemas.py
- **位置**: ml-service/
- **类**: HousingFeatures, PredictionResponse, ModelInfoResponse, HealthResponse
- **用途**: FastAPI的请求/响应数据模型，自动验证
- **特点**: 包含JSON示例和字段说明

### 3️⃣ train.py
- **位置**: ml-service/
- **功能**: 加载housing.csv → 训练LinearRegression → 保存model.joblib
- **指标**: 计算R²、RMSE、MSE、MAE
- **自动化**: 构建时自动运行
- **输出**: model.joblib（包含模型、指标、特征列表）

### 4️⃣ utils.py
- **位置**: ml-service/
- **函数**: load_model(), validate_features(), prepare_features_array()
- **用途**: 模型加载、参数验证、数据准备
- **特点**: 完善的异常处理和错误消息

### 5️⃣ main.py
- **位置**: ml-service/
- **接口数**: 3个
  - GET /health - 健康检查
  - POST /predict - 单条/批量预测
  - GET /model-info - 模型信息
- **特点**: 启动时自动加载模型、全局异常处理、自动文档生成

---

## 🚀 启动指令

### 最快方式（推荐）

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

### 标准步骤

```bash
# 进入目录
cd ml-service

# 1. 安装依赖（如果未安装）
pip install -r requirements.txt

# 2. 训练模型（如果model.joblib不存在）
python train.py

# 3. 启动服务
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🧪 测试方法

### 方法1：自动化测试
```bash
# 新终端窗口
python test_api.py
```

输出示例：
```
Total: 5/5 tests passed
✓ All tests passed! API is working correctly.
```

### 方法2：Swagger UI（交互式）
启动服务后访问：
```
http://localhost:8000/docs
```

可以直接在浏览器中测试所有接口。

### 方法3：curl命令
```bash
# 健康检查
curl http://localhost:8000/health

# 单条预测
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": -122.25,
    "latitude": 37.85,
    "housing_median_age": 52.0,
    "total_rooms": 1820.0,
    "total_bedrooms": 300.0,
    "population": 806.0,
    "households": 270.0,
    "median_income": 3.1
  }'

# 获取模型信息
curl http://localhost:8000/model-info
```

---

## 📊 API接口速查表

| 接口 | 方法 | 输入 | 输出 |
|-----|------|------|------|
| /health | GET | 无 | {status, model_loaded, version, timestamp} |
| /predict | POST | 单条或数组 | {predictions, status, message} |
| /model-info | GET | 无 | {coefficients, intercept, feature_names, metrics} |

### 预测请求格式

**单条：**
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

**批量（数组）：**
```json
[
  { "longitude": -122.25, "latitude": 37.85, ... },
  { "longitude": -122.40, "latitude": 37.95, ... }
]
```

---

## ⚠️ 常见问题速查

### Q1: "Model not found" 错误
**原因**: model.joblib文件不存在
**解决**: 运行 `python train.py`

### Q2: "Missing features" 错误
**原因**: 缺少必需的8个特征字段
**解决**: 确保请求包含所有8个字段

### Q3: 端口已被占用
**原因**: 8000端口被其他进程占用
**解决**: 
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### Q4: Python导入错误
**原因**: 依赖未正确安装
**解决**: 重新运行 `pip install -r requirements.txt`

### Q5: 如何修改端口？
**解决**: 修改启动命令中的--port参数
```bash
python -m uvicorn main:app --port 9000
```

---

## 📝 文件修改日记

如果需要修改某些功能，参考以下指南：

### 要修改预测特征
编辑: `schemas.py` → HousingFeatures 类

### 要修改模型算法
编辑: `train.py` → 修改LinearRegression为其他算法

### 要添加新的API端点
编辑: `main.py` → 在app后添加新的@app.get或@app.post

### 要修改返回响应格式
编辑: `schemas.py` 中的响应模型类

### 要修改数据验证规则
编辑: `utils.py` 中的validate_features函数

---

## 🔍 验证清单（启动前检查）

- [ ] housing.csv 文件存在于 ml-service/ 目录
- [ ] 所有5个源文件都已创建
- [ ] Python版本 >= 3.10
- [ ] pip包管理器可用
- [ ] 系统可以访问互联网（首次安装依赖）
- [ ] 8000端口未被占用

---

## 📚 相关文档

- **详细说明**: ml-service/README.md
- **API文档**: http://localhost:8000/docs (启动后)
- **完成报告**: STAGE1_COMPLETION_REPORT.md (项目根目录)

---

## ✨ 特色功能

1. **单条+批量双模式**: /predict 接口智能处理两种格式
2. **完整的模型信息**: 系数、截距、所有评估指标一次获取
3. **自动文档生成**: Swagger UI + ReDoc 自动生成
4. **生产级异常处理**: 所有错误都返回JSON + 清晰消息
5. **模块化架构**: 代码分层清晰，易于维护和扩展

---

**准备好启动了吗？选择上面的启动方式之一，开始测试吧！** 🚀
