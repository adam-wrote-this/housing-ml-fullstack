# 全栈房价预测系统 从零实现执行指南
（供本地执行 Agent 使用，按阶段顺序执行，前一阶段验证通过后方可进入下一阶段）

## 指南说明
- **目标**：完整实现面试机试题 Task1 + Task2，最终交付一套可通过 `docker compose up --build` 一键启动的全栈系统，面试官克隆代码即可直接运行演示。
- **执行原则**：
  1. 严格按阶段顺序执行，底层服务优先完成
  2. 每阶段完成后必须执行验证步骤，确认功能正常再继续
  3. 所有服务地址、端口全部通过环境变量注入，禁止硬编码
  4. 代码分层清晰，不写单文件大段逻辑
  5. ML 模型采用 sklearn 标准线性回归，不做自定义调参，构建阶段自动生成

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
6. 阶段 5：容器化改造与 Docker Compose 编排
7. 阶段 6：全链路容器联调与功能自测
8. 阶段 7：交付文档整理与最终验收

---

## 阶段 0：项目骨架搭建与前置准备
### 阶段目标
创建标准目录结构，初始化基础配置文件，准备数据集。
### 执行步骤
1. 创建项目根目录 `housing-price-fullstack`
2. 在根目录下创建 4 个子服务目录：
   - `ml-service`
   - `backend-python`
   - `backend-java`
   - `nextjs-portal`
3. 根目录创建基础占位文件：
   - `README.md`（总说明，后续完善）
   - `.gitignore`（忽略 node_modules、__pycache__、target、.env、*.joblib 等）
   - `.env.example`（全局环境变量模板）
   - `docker-compose.yml`（占位，阶段 5 完善）
4. 将房价数据集 `housing.csv` 放入 `ml-service` 目录
5. 确认本地基础环境（开发阶段可选安装）：Python 3.12+、JDK 21、Node 20+、Docker Desktop

### 产出物
- 标准目录结构
- 根目录基础配置文件
- 数据集就位

### 验证标准
- 目录结构与 TRD 规定完全一致
- 数据集文件可正常读取

---

## 阶段 1：Task1 ML 房价推理服务开发
### 阶段目标
完成机器学习推理服务，实现 3 个强制接口，本地可通过 Swagger 调试。
### 执行步骤
1. 在 `ml-service` 目录下创建 `requirements.txt`，写入依赖：
   `fastapi、uvicorn、scikit-learn、pandas、joblib、pydantic`
2. 编写 `schemas.py`：定义房屋特征 Pydantic 模型，同时支持单条对象和批量数组入参
3. 编写 `train.py`：
   - 读取 `housing.csv`
   - 划分训练集/测试集
   - 训练 LinearRegression 线性回归模型
   - 计算 R²、RMSE、MSE、MAE 指标
   - 将模型 + 指标 + 特征列表保存为 `model.joblib`
4. 编写 `utils.py`：封装模型加载函数、指标读取函数
5. 编写 `main.py`，实现 3 个接口：
   - `GET /health`：返回服务状态、模型加载状态
   - `POST /predict`：支持单条/批量预测，参数校验，异常捕获
   - `GET /model-info`：返回系数、截距、评估指标
6. 本地启动服务：`uvicorn main:app --reload --port 8000`
7. 访问 `http://localhost:8000/docs`，逐项测试 3 个接口

### 产出物
- `ml-service/` 下完整源码
- 本地接口测试通过

### 验证标准
- 单条预测正常返回价格
- 批量预测正常返回对应数量结果
- model-info 返回系数和全部指标
- health 接口返回 200
- 非法入参返回清晰错误信息

---

## 阶段 2：App1 Python FastAPI 业务后端开发
### 阶段目标
实现房源录入业务后端，接收前端表单，转发调用 ML 服务返回预测结果。
### 执行步骤
1. 在 `backend-python` 目录下创建 `requirements.txt`，写入依赖：
   `fastapi、uvicorn、httpx、pydantic`
2. 编写 `schemas.py`：定义前端提交的房屋特征请求体、预测返回体
3. 编写 `client.py`：封装 HTTP 客户端，读取环境变量中的 ML 服务地址，调用 `/predict` 接口
4. 编写 `main.py`：
   - 实现 `POST /property/predict` 接口，接收前端表单数据
   - 调用 ML 服务客户端获取预测结果
   - 统一封装返回格式，捕获 ML 服务异常并返回友好错误
5. 本地启动服务，端口 8001
6. 使用 Postman/Swagger 测试接口，验证能正常调用阶段 1 的 ML 服务

### 产出物
- `backend-python/` 下完整源码
- 本地与 ML 服务联调通过

### 验证标准
- 提交合法特征能正常返回预测房价
- ML 服务不可用时返回友好错误，不崩溃
- 参数校验正常，非法输入返回明确错误信息

---

## 阶段 3：App2 Java SpringBoot 市场分析后端开发
### 阶段目标
实现房产市场分析后端，提供筛选接口、What-if 仿真接口，对接 ML 服务。
### 执行步骤
1. 在 `backend-java` 目录下创建 `pom.xml`：
   - 指定 Java 21、Spring Boot 3.4.4
   - 引入 spring-boot-starter-web、lombok 等基础依赖
2. 创建标准 SpringBoot 目录结构：
   `src/main/java/com/property/` 下分 `controller`、`service`、`dto`、`config`
3. 编写 DTO 类：房屋特征请求、预测结果返回、市场筛选参数
4. 编写配置类：注入 RestTemplate，读取环境变量中的 ML 服务地址
5. 编写 `MlClientService`：封装对 ML 服务 `/predict` 接口的 HTTP 调用
6. 编写 `MarketService`：实现市场筛选逻辑、What-if 仿真计算逻辑
7. 编写 `MarketController`，实现两个核心接口：
   - `GET /market/segments`：根据筛选条件返回市场分段统计数据
   - `POST /market/whatif`：接收调整后的特征，调用 ML 服务返回仿真价格
8. 本地启动服务，端口 8080
9. 测试接口，验证能正常调用阶段 1 的 ML 服务

### 产出物
- `backend-java/` 下完整 SpringBoot 源码
- 本地与 ML 服务联调通过

### 验证标准
- 市场筛选接口正常返回统计数据
- What-if 接口正常返回调整后的预测价格
- ML 服务异常时有统一错误处理

---

## 阶段 4：Next.js 统一前端门户开发
### 阶段目标
搭建 App Router 架构的统一前端，实现两个子应用页面，分别对接 Python、Java 后端。
### 执行步骤
1. 初始化 Next.js 项目到 `nextjs-portal` 目录：
   - 启用 App Router、TypeScript、Tailwind CSS、ESLint
2. 配置 `next.config.js`：添加重写代理，分别转发 Python、Java 后端请求，解决跨域
3. 创建 `.env.local.example`：定义两个后端的基础地址环境变量
4. 封装工具层：
   - `lib/env.ts`：统一读取环境变量
   - `lib/api/baseFetch.ts`：统一请求拦截器，处理 loading、错误
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
9. 本地启动前端（端口 3000），分别对接两个后端测试全流程

### 产出物
- `nextjs-portal/` 下完整前端代码
- 本地分别与两个后端联调通过

### 验证标准
- 房源表单页：填写提交后正常显示预测价格，加载/错误状态正常
- 市场分析页：筛选功能可用，What-if 滑块调整后价格实时更新
- 响应式布局在不同宽度下正常显示
- 全局 loading、错误提示统一生效

---

## 阶段 5：容器化改造与 Docker Compose 编排
### 阶段目标
为每个服务编写 Dockerfile，通过 docker-compose 统一编排，实现容器间互通。
### 执行步骤
1. 为 `ml-service` 编写 Dockerfile：
   - 基础镜像 `python:3.12-slim`
   - 分层拷贝依赖、安装
   - 拷贝全部代码与数据集
   - 构建阶段执行 `python train.py` 自动生成模型
   - 暴露 8000 端口，uvicorn 启动
2. 为 `backend-python` 编写 Dockerfile：
   - 基础镜像 `python:3.12-slim`
   - 安装依赖、拷贝代码
   - 读取环境变量获取 ML 服务地址
   - 暴露 8001 端口
3. 为 `backend-java` 编写 Dockerfile：
   - 多阶段构建：maven 构建 + jdk 运行
   - 基础镜像 `eclipse-temurin:21-jdk`
   - 暴露 8080 端口
4. 为 `nextjs-portal` 编写 Dockerfile：
   - 多阶段构建：依赖安装 → 构建 → 生产运行
   - 基础镜像 `node:20-alpine`
   - 暴露 3000 端口
5. 编写根目录 `docker-compose.yml`：
   - 定义 4 个服务：ml-service、app1-python、app2-java、frontend
   - 每个服务指定 build 路径、端口映射
   - 通过环境变量注入 ML 服务地址：`http://ml-service:8000`
   - 配置 `depends_on`：两个后端依赖 ml-service
   - 不配置 volumes 挂载，保证镜像自包含

### 产出物
- 4 个服务各自的 Dockerfile
- 根目录 `docker-compose.yml`

### 验证标准
- 每个服务可单独 `docker build` 成功
- compose 配置无语法错误

---

## 阶段 6：全链路容器联调与功能自测
### 阶段目标
验证容器化整套系统可正常运行，所有功能符合需求。
### 执行步骤
1. 关闭所有本地运行的服务，确保仅通过容器运行
2. 根目录执行命令：`docker compose up --build`
3. 等待所有镜像构建完成、容器全部启动
4. 逐项自测验证：
   1. 访问 `http://localhost:8000/docs`，测试 ML 服务三个接口
   2. 访问 `http://localhost:3000`，打开前端门户
   3. 进入房源录入页，提交表单，验证预测结果正常返回
   4. 进入市场分析页，测试筛选功能、What-if 滑块实时预测
   5. 测试异常场景：非法输入、错误参数，验证全局错误提示
   6. 验证加载状态：提交请求时显示全局 loading
5. 如有构建失败、接口不通、页面报错等问题，逐一修复后重新构建验证
6. 验证清理命令：`docker compose down` 可正常停止并清理容器

### 产出物
- 可一键完整运行的容器化系统
- 所有功能自测通过

### 验证标准
- 一条命令启动全部服务，无报错
- 所有业务功能全链路正常
- 异常场景有友好提示，服务不崩溃
- 容器间通信正常，无硬编码地址问题

---

## 阶段 7：交付文档整理与最终验收
### 阶段目标
完善所有文档，对齐交付标准，确保面试官克隆代码即可直接运行。
### 执行步骤
1. 完善根目录 `README.md`，包含：
   - 项目简介
   - 前置环境：仅需 Docker + Docker Compose
   - 一键启动命令、停止命令
   - 各服务访问地址
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
- [ ] 每个服务有独立 Dockerfile
- [ ] 根目录 docker-compose.yml 可一键启动全部服务
- [ ] ML 服务三个接口全部可用，支持单条+批量预测
- [ ] Python 后端可正常调用 ML 服务
- [ ] Java 后端可正常调用 ML 服务，提供筛选与 What-if 接口
- [ ] Next.js 前端使用 App Router，合理区分服务端/客户端组件
- [ ] 前端实现全局 loading、错误边界
- [ ] Tailwind 响应式布局，基础 WCAG 适配
- [ ] 所有服务地址通过环境变量注入，无硬编码
- [ ] 数据集随代码提交，镜像构建时自动生成模型
- [ ] 根目录 README 清晰，启动步骤明确
- [ ] `docker compose up --build` 可一次性构建运行成功
- [ ] 全链路功能演示无阻塞