# Housing Price Fullstack

房价预测全栈面试题实现仓库，包含：

- Task 1：FastAPI 房价预测模型服务
- Task 2：Next.js 统一门户 + Python 后端 + Java 后端

## 参考资料

以下文件为题目来源与数据依据，建议保留为只读参考：

- [docs/Interview Tasks Fullstack.pdf](./docs/Interview%20Tasks%20Fullstack.pdf)
- [docs/House Price Dataset.csv](./docs/House%20Price%20Dataset.csv)
- [docs/Test Data For Prediction.csv](./docs/Test%20Data%20For%20Prediction.csv)

## 推荐约定

- 原始题目与数据放在 `docs/`
- 运行代码分别放在各自服务目录
- 服务间地址通过环境变量配置，不要硬编码

## 目标目录

```text
housing-price-fullstack/
├── ml-service/
├── backend-python/
├── backend-java/
├── nextjs-portal/
└── docs/
```

## 开发说明

当前仓库用于逐步实现完整交付版本，后续会补齐：

- 各服务源码
- Dockerfile
- docker-compose.yml
- 各模块 README

## 交付目标

最终可通过以下命令一键启动：

```bash
docker compose up --build
```

停止服务：

```bash
docker compose down
```
