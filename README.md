# Housing ML Fullstack

全栈房价预测系统（Task1 + Task2）最终交付版。  
本项目可通过 Docker 一键启动，面试官克隆后无需本地安装 Python/JDK/Node。

## 1. 项目简介

系统包含 4 个服务：

1. `ml-service`：FastAPI + sklearn 线性回归模型服务  
2. `backend-python`：App1 Python 业务后端（房源录入预测）  
3. `backend-java`：App2 Java Spring Boot 市场分析后端  
4. `nextjs-portal`：Next.js 统一前端门户（App Router）

## 2. System Architecture / 系统架构

```text
                        ┌──────────────────────────────┐
                        │   User / Browser            │
                        │   用户 / 浏览器             │
                        └──────────────┬───────────────┘
                                       │
                                       │ Access / 访问
                                       ▼
                ┌──────────────────────────────────────────┐
                │  Next.js Portal / 前端门户             │
                │  frontend:3000                         │
                │  - Home / 首页                          │
                │  - Property Form / 房源录入            │
                │  - Market Analysis / 市场分析          │
                └──────────────┬───────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
      ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
      │ Python Backend    │   │ Java Backend      │   │ ML Inference      │
      │ app1-python       │   │ app2-java         │   │ ml-service        │
      │ 8001              │   │ 8080              │   │ 8000              │
      │                   │   │                   │   │                   │
      │ /property/predict │   │ /market/segments  │   │ /health           │
      │                   │   │ /market/whatif    │   │ /predict          │
      │                   │   │                   │   │ /model-info       │
      └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
                │                         │                         │
                │                         │                         │
                └─────────────────────────┼─────────────────────────┘
                                          │
                                          │ Load training data / model
                                          │ 读取训练数据 / 载入模型
                                          ▼
                            ┌──────────────────────────────┐
                            │ housing.csv + LinearRegression│
                            │ model / 模型                 │
                            └──────────────────────────────┘
```

### Architecture Story / 架构说明

- Frontend calls the appropriate backend via Next.js rewrites to avoid CORS issues.  
  前端通过 Next.js rewrite 代理调用对应后端，避免跨域问题。
- Python backend handles property submission and invokes the ML service for price prediction.  
  Python 后端负责房源录入场景，接收表单数据后调用 ML 服务进行房价预测。
- Java backend handles market analysis and what-if simulation using the same ML service.  
  Java 后端负责市场分析场景，调用同一 ML 服务进行价格仿真和分段分析。
- ML service trains and serves a `LinearRegression` model from `housing.csv`, exposing `/health`, `/predict`, and `/model-info`.  
  ML 服务从 `housing.csv` 读取数据并提供线性回归模型，并暴露 `/health`、`/predict`、`/model-info` 等接口。
- All inter-service communication uses Docker service names such as `http://ml-service:8000`, which keeps the system containerized and environment-agnostic.  
  所有服务间通信均使用 Docker 内部服务名，例如 `http://ml-service:8000`，确保系统适配容器网络且不依赖宿主机硬编码。

## 3. 前置环境（仅需一个）

- Docker Desktop

验证：

```bash
docker --version
docker compose version
```

## 4. 一键启动 / 停止

在仓库根目录执行：

```bash
docker compose up --build
```

停止并清理：

```bash
docker compose down
```

如需彻底清理卷和孤儿容器：

```bash
docker compose down --volumes --remove-orphans
```

## 5. 服务访问地址

| 服务 | 地址 | 说明 |
|---|---|---|
| 前端门户 | http://localhost:3000 | 首页、房源录入、市场分析 |
| ML 服务 | http://localhost:8000 | `/health` `/predict` `/model-info` |
| ML Swagger | http://localhost:8000/docs | ML 接口文档 |
| Python 后端 | http://localhost:8001 | `/health` `/property/predict` |
| Python Swagger | http://localhost:8001/docs | App1 接口文档 |
| Java 后端 | http://localhost:8080 | `/health` `/market/segments` `/market/whatif` |
| Java Swagger | http://localhost:8080/docs | App2 接口文档 |

## 6. 面试演示流程（建议）

1. 运行 `docker compose up --build`
2. 打开前端首页 `http://localhost:3000`
3. 进入 **Property Form**，提交表单，展示预测价格
4. 进入 **Market Analysis**，查看市场分段数据
5. 调整 what-if 参数，展示预测变化
6. 演示后端接口文档：
   - `http://localhost:8001/docs`
   - `http://localhost:8080/docs`
   - `http://localhost:8000/docs`

## 7. 常见问题排查

### Q1: 构建慢或看起来“卡住”
首次构建会下载较大依赖（如 `numpy/scipy/pandas/scikit-learn`），通常是网络速度问题。  
可重试：

```bash
docker compose build --no-cache
```

### Q2: 3000 页面打不开
先检查容器状态：

```bash
docker compose ps
```

确认 `frontend`、`app1-python`、`app2-java`、`ml-service` 都是 `Up`/`healthy`。

### Q3: 前端调用报错
优先检查后端健康：

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8080/health
```

### Q4: 端口冲突
本项目默认占用 `3000/8000/8001/8080`。如冲突，请先停掉本机占用进程，或修改 [docker-compose.yml](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/docker-compose.yml) 端口映射。

## 8. 目录结构

```text
housing-ml-fullstack/
├── ml-service/
├── backend-python/
├── backend-java/
├── nextjs-portal/
├── docs/
└── docker-compose.yml
```

## 9. 模块文档

- [ml-service/README.md](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/ml-service/README.md)
- [backend-python/README.md](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/backend-python/README.md)
- [backend-java/README.md](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/backend-java/README.md)
- [nextjs-portal/README.md](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/nextjs-portal/README.md)

## 10. 最终验收 Checklist

- [x] 4 个服务源码完整，分层清晰
- [x] 每个服务有独立 Dockerfile，可单独构建
- [x] 根目录 [docker-compose.yml](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/docker-compose.yml) 定义全部 4 个服务，配置正确
- [x] `docker compose up --build` 一条命令启动全部服务，无报错
- [x] ML 服务三个接口可用，支持单条 + 批量预测
- [x] Python 后端通过容器网络调用 ML 服务，`/property/predict` 正常
- [x] Java 后端通过容器网络调用 ML 服务，`/market/segments` 和 `/market/whatif` 正常
- [x] Next.js 前端使用 App Router，服务端/客户端组件已区分
- [x] 前端实现全局 loading、错误提示与错误边界
- [x] 所有服务地址通过环境变量注入，无硬编码容器地址
- [x] 数据集随代码提交，镜像构建时自动生成模型
- [x] 根目录 README 已提供 Docker 一键启动说明
- [x] 全链路容器联调通过（本地自动化验证）

> 已执行一次全链路自动化验证：`build -> up -> health -> core API -> down`，结果通过。
