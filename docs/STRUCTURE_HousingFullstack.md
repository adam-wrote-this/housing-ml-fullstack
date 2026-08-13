# Housing Price Fullstack

本项目为房价预测全栈系统，包含 ML 推理服务、Python 后端、Java 后端和统一的 Next.js 前端门户。

## 项目结构

```text
housing-price-fullstack/
├── docker-compose.yml               # 全局编排文件，一键构建启动全部服务
├── README.md                        # 项目总文档：环境要求、启动命令、演示步骤、访问地址
├── .gitignore                       # 统一忽略镜像缓存、日志、本地环境文件、编译产物
├── .env.example                     # 全局环境变量模板（容器间服务地址统一配置）
│
├── ml-service/                      # Task1 房价 ML 推理服务（Python 3.12 + FastAPI）
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── housing.csv                  # 原始房源数据集（构建阶段训练模型）
│   ├── train.py                     # 模型训练脚本，生成模型并保存评估指标
│   ├── main.py                      # FastAPI 主服务：/health /predict /model-info
│   ├── schemas.py                   # Pydantic 入参校验模型
│   ├── utils.py                     # 模型加载、指标读取工具函数
│   └── README.md                    # 模块说明、Swagger 调试指引
│
├── backend-python/                  # Task2 App1 房源录入后端（FastAPI）
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                      # 表单接收、转发调用 ML 服务接口
│   ├── schemas.py
│   ├── client.py                    # HTTP 客户端，请求 ml-service 预测接口
│   └── README.md
│
├── backend-java/                    # Task2 App2 市场分析后端（Java 21 + Spring Boot 3.4.4）
│   ├── Dockerfile
│   ├── pom.xml
│   ├── .env.example
│   ├── src/
│   │   └── main/
│   │       ├── java/com/property/
│   │       │   ├── controller/     # 市场筛选、what-if 仿真接口
│   │       │   ├── service/        # 业务层，远程调用 ML 服务
│   │       │   ├── dto/            # 请求/返回实体
│   │       │   └── PropertyApplication.java
│   │       └── resources/
│   │           └── application.yml
│   └── README.md
│
└── nextjs-portal/                  # Task2 统一前端门户（Next.js App Router + Tailwind）
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── .env.local.example           # 前端后端接口地址环境变量模板
    ├── app/                         # App Router 路由
    │   ├── layout.tsx               # 全局 Layout：统一 Loading、全局 ErrorBoundary
    │   ├── page.tsx                 # 首页导航，跳转两个子应用
    │   ├── property-form/           # App1 房源录入页面（对接 Python 后端）
    │   │   ├── page.tsx             # 服务端组件外壳
    │   │   └── form-client.tsx      # 客户端交互表单
    │   └── market-analysis/         # App2 市场分析页面（对接 Java 后端）
    │       ├── page.tsx
    │       └── analysis-client.tsx  # 筛选器、What-if 滑块仿真工具
    ├── lib/
    │   ├── env.ts                   # 统一读取环境变量
    │   ├── api/
    │   │   ├── baseFetch.ts         # 统一请求拦截器
    │   │   ├── pythonApi.ts         # Python 后端接口封装
    │   │   └── javaApi.ts           # Java 后端接口封装
    │   └── types.ts                 # 全局 TS 类型定义（房屋特征、预测返回体）
    ├── components/
    │   ├── ui/                      # 通用无障碍基础组件（input/button/card）
    │   ├── common/
    │   │   ├── GlobalLoader.tsx      # 全局加载骨架
    │   │   ├── GlobalErrorAlert.tsx  # 全局错误弹窗
    │   │   └── ErrorBoundary.tsx     # 错误捕获边界
    │   ├── form/                    # 房源表单组件
    │   └── analysis/                # 筛选面板、What-if 调节滑块组件
    └── README.md
```

## 功能概览

- ML 推理服务：基于房价数据集训练线性回归模型，并提供预测接口
- Python 后端：接收房源录入数据，调用 ML 服务并返回预测结果
- Java 后端：提供市场分析、筛选和 what-if 仿真能力
- Next.js 前端：统一门户，承载两个子应用并提供一致的加载与错误体验

## 技术栈

- Python 3.12 + FastAPI
- Java 21 + Spring Boot 3.4.4
- Next.js App Router + Tailwind CSS
- Docker + Docker Compose
- scikit-learn + pandas + joblib

## 启动方式

```bash
docker compose up --build
```

如需清理环境：

```bash
docker compose down
```

## 访问说明

- ML 服务：Swagger UI /docs
- Python 后端：根据环境变量配置访问
- Java 后端：根据环境变量配置访问
- 前端门户：根据配置端口访问

## 说明

该项目遵循多服务分层架构，前端只通过后端调用 ML 推理服务，确保业务分离与可扩展性。