# 🐳 阶段1 Docker 验收快速指南

## ✅ 前置准备

确保您已安装 **Docker Desktop**：
- [下载 Docker Desktop](https://www.docker.com/products/docker-desktop)
- 启动 Docker Desktop 应用
- 验证：打开终端执行 `docker --version`

## 🚀 一键验收（3个步骤）

### 步骤1️⃣ 进入项目目录
```bash
cd housing-ml-fullstack
```

### 步骤2️⃣ 构建并启动服务
```bash
docker compose up --build ml-service
```

**等待输出显示：**
```
housing-ml-service | INFO:     ✓ Model loaded successfully. Features: [...]
housing-ml-service | INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 步骤3️⃣ 测试API（新终端窗口）

进入项目目录后，执行以下测试命令：

#### 测试1：健康检查
```bash
curl http://localhost:8000/health
```
**预期**：返回 `{"status":"ok","model_loaded":true,...}`

#### 测试2：单条预测
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
**预期**：返回预测房价（如 `{"predictions": 206000.0, ...}`)

#### 测试3：批量预测
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '[
    {"longitude": -122.25, "latitude": 37.85, "housing_median_age": 52.0, "total_rooms": 1820.0, "total_bedrooms": 300.0, "population": 806.0, "households": 270.0, "median_income": 3.1},
    {"longitude": -122.40, "latitude": 37.95, "housing_median_age": 30.0, "total_rooms": 2000.0, "total_bedrooms": 350.0, "population": 900.0, "households": 300.0, "median_income": 3.5}
  ]'
```
**预期**：返回预测数组 `{"predictions": [206000.0, 215000.0], ...}`

#### 测试4：模型信息
```bash
curl http://localhost:8000/model-info
```
**预期**：返回模型系数、截距和评估指标

#### 测试5：Swagger UI（浏览器）
访问 **http://localhost:8000/docs**

在浏览器中可视化地测试所有接口

---

## 🎯 验收清单

按照上面的步骤执行后，检查以下项目：

- [ ] Docker 镜像成功构建（`docker compose build ml-service`）
- [ ] 容器成功启动（`docker compose up ml-service`）
- [ ] 日志显示 "Model loaded successfully"
- [ ] `/health` 返回 HTTP 200 + `status: "ok"`
- [ ] `/predict` 单条预测返回一个数字
- [ ] `/predict` 批量预测返回数组
- [ ] `/model-info` 返回系数、截距和指标
- [ ] Swagger UI 可访问 (http://localhost:8000/docs)

✅ 全部通过 = **阶段1 Docker验收成功！**

---

## 🛑 停止服务

按 `Ctrl+C` 停止容器，或在新终端执行：
```bash
docker compose down
```

---

## 🆘 常见问题

### Q: Docker 命令未找到？
A: 确保 Docker Desktop 已启动（Windows 状态栏右下角可见 Docker 图标）

### Q: Port 8000 already in use?
A: 可能有其他服务占用端口，执行：
```bash
docker compose down
```

### Q: 镜像构建失败？
A: 检查网络连接，重试：
```bash
docker compose build --no-cache ml-service
```

### Q: 在浏览器访问 localhost:8000/docs 无响应？
A: 确保容器正在运行：
```bash
docker compose ps
```
应显示 `housing-ml-service` 处于 running 状态

---

## 📚 详细文档

更多信息查看：
- [DOCKER_VERIFICATION.md](./DOCKER_VERIFICATION.md) - 完整验收指南
- [ml-service/README.md](./ml-service/README.md) - ML服务使用说明

---

**🎉 现在就开始验收吧！**
```bash
docker compose up --build ml-service
```
