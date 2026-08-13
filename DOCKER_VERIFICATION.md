# ML-Service Docker 验收指南

## 📦 文件准备完毕

已成功创建以下文件用于Docker验收：

### 1. `ml-service/Dockerfile`
- ✅ 基础镜像：`python:3.12-slim`
- ✅ 4阶段构建流程：依赖安装 → 代码拷贝 → 模型生成 → 服务启动
- ✅ 构建时自动执行 `python train.py` 生成模型.joblib
- ✅ 启动命令使用 uvicorn，绑定 0.0.0.0:8000

### 2. `docker-compose.yml`
- ✅ 服务版本：3.9
- ✅ ml-service 配置完整
- ✅ 端口映射：8000:8000
- ✅ 健康检查配置
- ✅ 环境变量配置

---

## 🔧 前置条件（如未安装）

### Windows 上安装 Docker Desktop

1. **下载**：访问 https://www.docker.com/products/docker-desktop
2. **安装**：运行安装程序，按默认选项完成
3. **启动**：安装后启动 Docker Desktop 应用
4. **验证**：打开 PowerShell/CMD，执行：
   ```bash
   docker --version
   docker compose version
   ```
   应看到版本号输出

---

## 🚀 完整验收流程

### 第1步：构建 Docker 镜像

在项目根目录（`housing-ml-fullstack`）执行：

```bash
docker compose build ml-service
```

**预期输出**：
- 看到 "Building" 进度日志
- 包含 "Successfully tagged housing-ml-service:latest"
- 日志中应包含："Model saved to: /app/model.joblib"

### 第2步：启动容器

```bash
docker compose up ml-service
```

**预期输出**：
```
housing-ml-service | INFO:     ✓ Model loaded successfully. Features: [...]
housing-ml-service | INFO:     Uvicorn running on http://0.0.0.0:8000
```

容器成功启动，服务在 http://localhost:8000 监听

### 第3步：测试 API 接口（新终端）

#### 测试 1️⃣ - 健康检查
```bash
curl http://localhost:8000/health
```

**预期返回**：
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0",
  "timestamp": "2026-08-13T21:35:32.983Z"
}
```

#### 测试 2️⃣ - 单条预测
```bash
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
```

**预期返回**：
```json
{
  "predictions": 1.8726...,
  "status": "success",
  "message": "Single prediction completed"
}
```

#### 测试 3️⃣ - 批量预测
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '[
    {
      "longitude": -122.25,
      "latitude": 37.85,
      "housing_median_age": 52.0,
      "total_rooms": 1820.0,
      "total_bedrooms": 300.0,
      "population": 806.0,
      "households": 270.0,
      "median_income": 3.1
    },
    {
      "longitude": -122.40,
      "latitude": 37.95,
      "housing_median_age": 30.0,
      "total_rooms": 2000.0,
      "total_bedrooms": 350.0,
      "population": 900.0,
      "households": 300.0,
      "median_income": 3.5
    }
  ]'
```

**预期返回**：
```json
{
  "predictions": [1.8726..., 2.1450...],
  "status": "success",
  "message": "Batch prediction completed for 2 items"
}
```

#### 测试 4️⃣ - 模型信息
```bash
curl http://localhost:8000/model-info
```

**预期返回**：
```json
{
  "coefficients": [0.4519, 0.0095, -0.0047, 0.0003, ...],
  "intercept": -36.5234,
  "feature_names": ["longitude", "latitude", "housing_median_age", ...],
  "metrics": {
    "r2_score": 0.5757,
    "rmse": 0.7266,
    "mse": 0.5280,
    "mae": 0.5329
  }
}
```

#### 测试 5️⃣ - 错误处理（非法请求）
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

**预期返回**：HTTP 422 Unprocessable Entity，包含错误详情

### 第4步：清理容器

```bash
docker compose down
```

**预期结果**：
- 容器停止并移除
- 网络清理完毕
- 本地卷（如有）清理完毕

---

## ✅ 验收检查清单

| 项目 | 状态 | 说明 |
|------|------|------|
| Dockerfile 创建 | ✅ | 位置：`ml-service/Dockerfile` |
| docker-compose.yml 创建 | ✅ | 位置：`./docker-compose.yml` |
| 镜像构建成功 | ⏳ | 待手动验证 |
| 容器启动成功 | ⏳ | 待手动验证 |
| /health 接口 | ⏳ | 待手动测试 |
| /predict 单条预测 | ⏳ | 待手动测试 |
| /predict 批量预测 | ⏳ | 待手动测试 |
| /model-info 接口 | ⏳ | 待手动测试 |
| 错误处理 | ⏳ | 待手动测试 |
| docker compose down | ⏳ | 待手动验证 |

---

## 📝 故障排查

### 问题 1：docker 命令未找到

**原因**：Docker Desktop 未安装或 PATH 未更新

**解决**：
1. 安装 Docker Desktop（见前置条件）
2. 重启 PowerShell/CMD
3. 执行 `docker --version` 验证

### 问题 2：镜像构建失败 - "找不到 housing.csv"

**原因**：Dockerfile 中 COPY 命令路径不对

**检查**：`ml-service/` 目录中确实存在 `housing.csv` 文件

**解决**：重新执行 `docker compose build ml-service --no-cache`

### 问题 3：模型生成失败 - "Model saved to ... failed"

**原因**：train.py 执行出错，通常是数据问题或依赖问题

**检查**：
1. 本地运行 `python train.py` 验证是否正常
2. 检查 requirements.txt 中所有依赖版本是否正确

### 问题 4：容器启动后立即退出

**原因**：uvicorn 启动失败，通常是模型加载失败

**调试**：
```bash
docker compose logs ml-service
```
查看完整错误日志

### 问题 5：/health 接口返回 model_loaded: false

**原因**：模型在容器启动时未成功加载

**检查**：
1. 镜像是否正确包含了 model.joblib（在构建阶段生成）
2. 容器日志中是否有加载错误

---

## 🎯 Docker 验收完成标志

当完成以下所有步骤时，Docker 验收完成：

1. ✅ docker compose build ml-service 成功完成
2. ✅ docker compose up ml-service 正常启动
3. ✅ 所有 5 个 API 接口 (health, predict 单/批, model-info) 功能正常
4. ✅ 错误处理返回合适的 HTTP 状态码
5. ✅ docker compose down 能正常停止和清理
6. ✅ 镜像自包含（无需运行时挂载任何 volumes）

---

## 📊 关键特性说明

### 为什么使用多阶段构建？

虽然当前代码中所有阶段在同一个 Dockerfile 中，但逻辑上清晰地分为 4 个阶段：

1. **依赖安装阶段**：pip install
2. **代码准备阶段**：COPY 源代码
3. **模型生成阶段**：python train.py（关键！）
4. **服务启动阶段**：EXPOSE 和 CMD

**好处**：
- 模型在构建时一次性生成，容器启动时直接加载
- 不需要运行时计算，启动速度快
- 镜像自包含，可独立运行

### 为什么不需要 volumes 挂载？

- 所有代码和依赖已打包进镜像
- 模型已在构建阶段生成并保存在镜像中
- 数据集随镜像提供
- 容器是无状态的，支持水平扩展

---

## 🔄 后续集成步骤

完成 ml-service Docker 验收后，可继续：

1. **阶段 2**：为 backend-python 编写 Dockerfile
2. **阶段 3**：为 backend-java 编写 Dockerfile  
3. **阶段 4**：为 nextjs-portal 编写 Dockerfile
4. **阶段 5**：完善 docker-compose.yml，添加所有服务和依赖关系

---

**最后更新**：2026-08-13 21:35:32 UTC+8

