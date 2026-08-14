# nextjs-portal

统一前端门户（Next.js App Router + TypeScript + Tailwind）。

## 主要职责

- 提供首页导航
- 提供房源录入页面（调用 Python 后端）
- 提供市场分析页面（调用 Java 后端）
- 通过 Next.js rewrites 代理后端请求，避免跨域

## 页面

- `/` 首页
- `/property-form` 房源录入与预测
- `/market-analysis` 市场分段与 what-if 仿真

## API 代理规则

在 [next.config.mjs](C:/Users/ASUS/Documents/Dev/housing-ml-fullstack/nextjs-portal/next.config.mjs) 中：

- `/api/python/** -> ${PYTHON_BACKEND_URL}/**`
- `/api/java/** -> ${JAVA_BACKEND_URL}/**`

## 环境变量

- `PYTHON_BACKEND_URL`（容器内建议：`http://app1-python:8001`）
- `JAVA_BACKEND_URL`（容器内建议：`http://app2-java:8080`）

## 本地 Docker 验证

```bash
docker compose up --build
```

访问：

- `http://localhost:3000`
