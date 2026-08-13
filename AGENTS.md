# 全栈房价预测系统 从零实现执行指南
（供本地执行 Agent 使用，按阶段顺序执行，前一阶段 Docker 验收通过后方可进入下一阶段）

## 指南说明
- **目标**：完整实现面试机试题 Task1 + Task2，最终交付一套可通过 `docker compose up --build` 一键启动的全栈系统，面试官克隆代码即可直接运行演示。
- **执行原则**：
  1. 严格按阶段顺序执行，底层服务优先完成
  2. 每阶段完成后必须通过 Docker 验收，确认容器化功能正常再继续
  3. 所有服务地址、端口全部通过环境变量注入，禁止硬编码
  4. 代码分层清晰，不写单文件大段逻辑
  5. ML 模型采用 sklearn 标准线性回归，不做自定义调参，构建阶段自动生成
  6. **每个阶段必须包含 Dockerfile 和 docker-compose.yml 配置，验收方式统一为 Docker**

---

## 参考资料约定
- `docs/Interview Tasks Fullstack.pdf`：原始题目来源，只作为需求依据，不直接改写。
- `docs/House Price Dataset.csv`：训练数据源，保持原件不变；如需服务内使用，可在构建或初始化阶段复制到对应服务目录。
- `docs/Test Data For Prediction.csv`：预测/联调样例数据，仅用于手工验证与演示。
- 以上文件均属于只读参考资料；真正的实现代码、配置和运行产物应放在各自服务目录中。

---

## 总体阶段总览
1. 阶段 0：项目骨架搭建与前置准备
2. 阶段 1：Task1 ML 房价推理服务开发（核心依赖）
3. 阶段 2：App1 Python FastAPI 业务后端开发
4. 阶段 3：App2 Java SpringBoot 市场分析后端开发
5. 阶段 4：Next.js 统一前端门户开发
6. 阶段 5：全链路容器联调与功能自测
7. 阶段 6：交付文档整理与最终验收

> **注意**：原阶段 5（容器化改造）已合并进每个开发阶段，每阶段开发完成即同步完成该服务的 Dockerfile 和 docker-compose 配置。

---

## 阶段 0：项目骨架搭建与前置准备
### 阶段目标
创建标准目录结构，初始化基础配置文件，准备数据集。

### 执行步骤
1. 创建项目根目录 `housing-ml-fullstack`
2. 在根目录下创建 4 个子服务目录：
   - `ml-service`
   - `backend-python`
   - `backend-java`
   - `nextjs-portal`
3. 根目录创建基础占位文件：
   - `README.md`（总说明，后续完善）
   - `.gitignore`（忽略 node_modules、__pycache__、target、.env、*.joblib 等）
   - `.env.example`（全局环境变量模板）
   - `docker-compose.yml`（占位，各阶段逐步完善）
4. 将房价数据集 `housing.csv` 放入 `ml-service` 目录
5. 确认本地已安装 Docker Desktop（**唯一必须的本地环境**，无需安装 Python/JDK/Node）

### 产出物
- 标准目录结构
- 根目录基础配置文件
- 数据集就位

### 验证标准
- 目录结构完整，4 个服务目录存在
- `docker-compose.yml` 文件存在（即使内容为空）
- 数据集文件 `ml-service/housing.csv` 可正常读取
- `docker --version` 命令可执行，返回版本号

---

## 阶段 1：Task1 ML 房价推理服务开发
### 阶段目标
完成 ML 推理服务的开发与容器化，实现 3 个强制接口，通过 Docker 验收。

### 执行步骤
1. 在 `ml-service` 目录下创建 `requirements.txt`，写入依赖：
   `fastapi、uvicorn[standard]、scikit-learn、pandas、joblib、pydantic`
2. 编写 `schemas.py`：定义房屋特征 Pydantic 模型，同时支持单条对象和批量数组入参
3. 编写 `train.py`：
   - 读取 `housing.csv`（列名：square_footage, bedrooms, bathrooms, year_built, lot_size, distance_to_city_center, school_rating, price）
   - 划分训练集/测试集（8:2）
   - 训练 LinearRegression 线性回归模型
   - 计算 R²、RMSE、MSE、MAE 指标
   - 将模型 + 指标 + 特征列表保存为 `model.joblib`
4. 编写 `utils.py`：封装模型加载函数、特征验证函数
5. 编写 `main.py`，实现 3 个接口：
   - `GET /health`：返回服务状态、模型加载状态
   - `POST /predict`：支持单条/批量预测，参数校验，异常捕获
   - `GET /model-info`：返回系数、截距、评估指标
6. 编写 `ml-service/Dockerfile`：
   - 基础镜像 `python:3.12-slim`
   - 分层安装依赖（利用缓存）
   - 拷贝全部代码与数据集
   - 构建阶段执行 `RUN python train.py` 自动生成模型
   - 暴露 8000 端口，CMD 启动 uvicorn
7. 更新根目录 `docker-compose.yml`，添加 `ml-service` 服务配置：
   - build context 指向 `./ml-service`
   - 端口映射 `8000:8000`
   - 配置 healthcheck

### 产出物
- `ml-service/` 下完整源码（schemas.py、train.py、utils.py、main.py、requirements.txt）
- `ml-service/Dockerfile`
- `docker-compose.yml` 包含 ml-service 服务定义

### Docker 验收步骤
```bash
# 构建并启动
docker compose up --build ml-service

# 新终端：健康检查
curl http://localhost:8000/health

# 单条预测
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'

# 批量预测（传入数组）
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '[{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2},{"square_footage":2100,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":9200,"distance_to_city_center":7.3,"school_rating":8.5}]'

# 模型信息
curl http://localhost:8000/model-info

# 停止
docker compose down
```

### 验收标准（全部基于 Docker）
- `docker compose build ml-service` 成功，日志出现 "Model saved to: /app/model.joblib"
- `docker compose up ml-service` 容器启动后日志出现 "Model loaded successfully"
- `GET /health` 返回 HTTP 200，`model_loaded: true`
- `POST /predict` 单条返回一个数字（房价）
- `POST /predict` 批量传入 N 条，返回长度为 N 的数组
- `GET /model-info` 返回 coefficients、intercept、feature_names、metrics（含 R²、RMSE、MSE、MAE）
- 非法入参（缺字段/类型错误）返回 HTTP 422，不崩溃
- 访问 `http://localhost:8000/docs` Swagger UI 可正常加载
- `docker compose down` 可正常清理容器

---

## 阶段 2：App1 Python FastAPI 业务后端开发
### 阶段目标
实现房源录入业务后端，接收前端表单，转发调用 ML 服务返回预测结果，通过 Docker 容器间联调验收。

### 执行步骤
1. 在 `backend-python` 目录下创建 `requirements.txt`：
   `fastapi、uvicorn[standard]、httpx、pydantic`
2. 编写 `schemas.py`：定义前端提交的房屋特征请求体、预测返回体
3. 编写 `client.py`：封装 HTTP 客户端，从环境变量 `ML_SERVICE_URL` 读取 ML 服务地址，调用 `/predict` 接口
4. 编写 `main.py`：
   - 实现 `POST /property/predict` 接口，接收前端表单数据
   - 调用 ML 服务客户端获取预测结果
   - 统一封装返回格式，捕获 ML 服务异常并返回友好错误
   - 实现 `GET /health` 健康检查接口
5. 编写 `backend-python/Dockerfile`：
   - 基础镜像 `python:3.12-slim`
   - 分层安装依赖
   - 拷贝代码
   - 暴露 8001 端口，CMD 启动 uvicorn
6. 更新根目录 `docker-compose.yml`，添加 `app1-python` 服务配置：
   - build context 指向 `./backend-python`
   - 端口映射 `8001:8001`
   - 环境变量 `ML_SERVICE_URL=http://ml-service:8000`
   - `depends_on: [ml-service]`

### 产出物
- `backend-python/` 下完整源码
- `backend-python/Dockerfile`
- `docker-compose.yml` 新增 app1-python 服务定义

### Docker 验收步骤
```bash
# 同时启动 ml-service 和 app1-python
docker compose up --build ml-service app1-python

# 新终端：健康检查
curl http://localhost:8001/health

# 提交房屋特征，获取预测价格
curl -X POST http://localhost:8001/property/predict \
  -H "Content-Type: application/json" \
  -d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'

# 测试 ML 服务异常场景（停止 ml-service，确认 app1 返回友好错误而非崩溃）
docker compose stop ml-service
curl -X POST http://localhost:8001/property/predict \
  -H "Content-Type: application/json" \
  -d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'

docker compose down
```

### 验收标准（全部基于 Docker）
- `docker compose build app1-python` 成功
- `docker compose up ml-service app1-python` 两个容器均正常启动
- `GET /health` 返回 HTTP 200
- `POST /property/predict` 传入合法特征，返回预测房价
- 容器内通过 `http://ml-service:8000` 调用 ML 服务（不使用 localhost）
- ML 服务停止时，`/property/predict` 返回友好错误（4xx/5xx + JSON），服务不崩溃
- 非法入参返回 HTTP 422，不崩溃
- `docker compose down` 正常清理

---

## 阶段 3：App2 Java SpringBoot 市场分析后端开发
### 阶段目标
实现房产市场分析后端，提供筛选接口、What-if 仿真接口，对接 ML 服务，通过 Docker 容器间联调验收。

### 执行步骤
1. 在 `backend-java` 目录下创建 `pom.xml`：
   - 指定 Java 21、Spring Boot 3.4.4
   - 引入 spring-boot-starter-web、lombok 等基础依赖
2. 创建标准 SpringBoot 目录结构：
   `src/main/java/com/property/` 下分 `controller`、`service`、`dto`、`config`
3. 编写 DTO 类：房屋特征请求、预测结果返回、市场筛选参数
4. 编写配置类：注入 RestTemplate，从环境变量 `ML_SERVICE_URL` 读取 ML 服务地址
5. 编写 `MlClientService`：封装对 ML 服务 `/predict` 接口的 HTTP 调用
6. 编写 `MarketService`：实现市场筛选逻辑（基于内置示例数据集）、What-if 仿真计算逻辑
7. 编写 `MarketController`，实现两个核心接口：
   - `GET /market/segments`：返回市场分段统计数据（按价格区间、面积区间等）
   - `POST /market/whatif`：接收特征参数，调用 ML 服务返回仿真预测价格
   - `GET /health`：健康检查
8. 编写 `backend-java/Dockerfile`（多阶段构建）：
   - 构建阶段：`maven:3.9-eclipse-temurin-21` 执行 `mvn package -DskipTests`
   - 运行阶段：`eclipse-temurin:21-jre-alpine` 运行 jar
   - 暴露 8080 端口
9. 更新根目录 `docker-compose.yml`，添加 `app2-java` 服务配置：
   - build context 指向 `./backend-java`
   - 端口映射 `8080:8080`
   - 环境变量 `ML_SERVICE_URL=http://ml-service:8000`
   - `depends_on: [ml-service]`

### 产出物
- `backend-java/` 下完整 SpringBoot 源码
- `backend-java/Dockerfile`
- `docker-compose.yml` 新增 app2-java 服务定义

### Docker 验收步骤
```bash
# 同时启动 ml-service 和 app2-java
docker compose up --build ml-service app2-java

# 新终端：健康检查
curl http://localhost:8080/health

# 市场分段统计
curl "http://localhost:8080/market/segments"

# What-if 仿真预测
curl -X POST http://localhost:8080/market/whatif \
  -H "Content-Type: application/json" \
  -d '{"square_footage":2000,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":9000,"distance_to_city_center":6.0,"school_rating":8.5}'

docker compose down
```

### 验收标准（全部基于 Docker）
- `docker compose build app2-java` 成功（含 maven 构建阶段）
- `docker compose up ml-service app2-java` 两个容器均正常启动
- `GET /health` 返回 HTTP 200
- `GET /market/segments` 返回市场分段统计数据（JSON 格式）
- `POST /market/whatif` 返回调整后的预测价格
- 容器内通过 `http://ml-service:8000` 调用 ML 服务
- ML 服务异常时有统一错误处理，Java 服务不崩溃
- `docker compose down` 正常清理

---

## 阶段 4：Next.js 统一前端门户开发
### 阶段目标
搭建 App Router 架构的统一前端，实现两个子应用页面，分别对接 Python、Java 后端，通过 Docker 完整前后端联调验收。

### 执行步骤
1. 初始化 Next.js 项目到 `nextjs-portal` 目录：
   - 启用 App Router、TypeScript、Tailwind CSS、ESLint
2. 配置 `next.config.js`：添加 rewrites 代理，分别转发 Python、Java 后端请求，解决跨域：
   - `/api/python/**` → `PYTHON_BACKEND_URL/**`
   - `/api/java/**` → `JAVA_BACKEND_URL/**`
3. 创建 `.env.local.example`，定义环境变量：
   - `PYTHON_BACKEND_URL=http://app1-python:8001`
   - `JAVA_BACKEND_URL=http://app2-java:8080`
4. 封装工具层：
   - `lib/api/pythonApi.ts`：封装 App1 所有接口
   - `lib/api/javaApi.ts`：封装 App2 所有接口
   - `lib/types.ts`：全局 TypeScript 类型定义
5. 实现全局布局与通用组件：
   - `app/layout.tsx`：全局布局，通过 Context 管理全局 loading、错误状态
   - 通用 UI 组件：Button、Input、Card、Skeleton 等，基础 WCAG 适配
   - `GlobalLoader`、`GlobalErrorAlert`、`ErrorBoundary` 全局异常组件
6. 开发 App1 房源录入页面（`app/property-form/`）：
   - `page.tsx`：服务端组件外壳
   - `form-client.tsx`：客户端组件，实现表单、校验、提交、展示结果
7. 开发 App2 市场分析页面（`app/market-analysis/`）：
   - `page.tsx`：服务端组件外壳
   - `analysis-client.tsx`：客户端组件，实现筛选面板、What-if 滑块、结果展示
8. 开发首页导航页，可跳转两个子应用
9. 编写 `nextjs-portal/Dockerfile`（多阶段构建）：
   - 依赖安装阶段：`node:20-alpine` 安装 npm 依赖
   - 构建阶段：执行 `npm run build`
   - 运行阶段：`node:20-alpine` 启动 `next start`
   - 暴露 3000 端口
10. 更新根目录 `docker-compose.yml`，添加 `frontend` 服务配置：
    - build context 指向 `./nextjs-portal`
    - 端口映射 `3000:3000`
    - 环境变量注入两个后端地址（使用容器服务名）
    - `depends_on: [app1-python, app2-java]`

### 产出物
- `nextjs-portal/` 下完整前端代码
- `nextjs-portal/Dockerfile`
- `docker-compose.yml` 新增 frontend 服务定义，全部 4 个服务配置完整

### Docker 验收步骤
```bash
# 一键启动全部 4 个服务
docker compose up --build

# 访问前端门户
open http://localhost:3000

# 验收清单（浏览器手动验收）：
# 1. 首页可正常加载，显示导航入口
# 2. 进入"房源录入"页，填写表单并提交 → 显示预测价格
# 3. 提交时显示全局 loading 动画
# 4. 进入"市场分析"页，查看市场分段数据
# 5. 调整 What-if 滑块 → 价格实时更新
# 6. 提交非法数据 → 全局错误提示正确显示
# 7. 断开后端服务 → 前端错误边界生效，不白屏崩溃

docker compose down
```

### 验收标准（全部基于 Docker）
- `docker compose build frontend` 成功（含 Next.js 构建阶段）
- `docker compose up --build` 全部 4 个服务均正常启动，无报错
- `http://localhost:3000` 可访问，首页正常显示
- 房源录入页：填写表单提交后，显示预测房价；加载期间显示全局 loading
- 市场分析页：筛选功能可用；What-if 滑块调整后预测价格更新
- 响应式布局在不同宽度下正常显示（>= 375px）
- 全局 loading、错误提示统一生效
- 错误边界生效，后端不可用时不白屏
- `docker compose down` 正常清理全部容器

---

## 阶段 5：全链路容器联调与功能自测
### 阶段目标
对完整的 4 服务系统做最终全链路验收，确保从一条命令启动到所有功能可用。

### 执行步骤
1. 执行完整清理：`docker compose down --volumes --remove-orphans`
2. 执行完整重建：`docker compose up --build`（不加服务名，启动全部）
3. 等待所有容器健康（`docker compose ps` 所有服务状态为 running/healthy）
4. 按顺序逐项自测：
   1. `curl http://localhost:8000/health` → ml-service 正常
   2. `curl http://localhost:8001/health` → app1-python 正常
   3. `curl http://localhost:8080/health` → app2-java 正常
   4. 浏览器访问 `http://localhost:3000` → 前端正常
   5. 房源录入全流程（前端 → app1-python → ml-service）
   6. 市场分析全流程（前端 → app2-java → ml-service）
   7. 异常场景（非法输入、后端异常）
5. 确认无跨容器硬编码地址，所有服务间通信均通过 Docker 网络服务名

### 产出物
- 可一键完整运行的容器化系统
- 全链路自测通过记录

### 验收标准
- `docker compose up --build` 一条命令启动全部服务，无报错
- 全部 4 个服务均通过健康检查
- 房源录入全链路端到端正常
- 市场分析全链路端到端正常
- 异常场景有友好提示，所有服务不崩溃
- `docker compose down` 完整清理

---

## 阶段 6：交付文档整理与最终验收
### 阶段目标
完善所有文档，对齐交付标准，确保面试官克隆代码即可直接运行。

### 执行步骤
1. 完善根目录 `README.md`，包含：
   - 项目简介
   - 前置环境：**仅需 Docker Desktop**，无需安装 Python/JDK/Node
   - 一键启动命令：`docker compose up --build`
   - 停止命令：`docker compose down`
   - 各服务访问地址表格
   - 面试演示完整流程步骤
   - 常见问题排查
2. 为每个子服务编写模块级 `README.md`，说明模块功能、接口列表
3. 完善根目录 `.env.example`，标注所有可配置项
4. 清理临时文件、本地运行产物，确保 `.gitignore` 生效
5. 最终核对交付验收 Checklist，逐项确认
6. 代码提交至 GitHub 公开仓库

### 产出物
- 完整可交付的 GitHub 仓库
- 齐全的文档与说明

### 最终验收 Checklist
- [ ] 4 个服务源码完整，分层清晰
- [ ] 每个服务有独立 Dockerfile，可单独 `docker build` 成功
- [ ] 根目录 `docker-compose.yml` 定义全部 4 个服务，配置正确
- [ ] `docker compose up --build` 一条命令启动全部服务，无报错
- [ ] ML 服务三个接口全部可用，支持单条+批量预测
- [ ] Python 后端通过容器网络调用 ML 服务，`/property/predict` 正常
- [ ] Java 后端通过容器网络调用 ML 服务，`/market/segments` 和 `/market/whatif` 正常
- [ ] Next.js 前端使用 App Router，合理区分服务端/客户端组件
- [ ] 前端实现全局 loading、错误边界
- [ ] Tailwind 响应式布局，基础 WCAG 适配
- [ ] 所有服务地址通过环境变量注入，无硬编码
- [ ] 数据集随代码提交，镜像构建时自动生成模型
- [ ] 根目录 README 清晰，启动步骤仅需 Docker Desktop
- [ ] 全链路功能演示无阻塞
