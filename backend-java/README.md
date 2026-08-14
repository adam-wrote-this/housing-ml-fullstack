# backend-java

App2 Java 后端（Spring Boot 3 + Java 21）。  
提供市场分段统计和 what-if 仿真接口，并调用 `ml-service` 进行预测。

## 主要职责

- 提供健康检查
- 提供市场分段统计：`GET /market/segments`
- 提供 what-if 仿真：`POST /market/whatif`

## 接口

### `GET /health`
返回服务健康状态。

### `GET /market/segments`
返回价格分段统计数据（数量、均价、最值、平均面积等）。

### `POST /market/whatif`
请求示例：

```json
{
  "squareFootage": 2000,
  "bedrooms": 4,
  "bathrooms": 2.5,
  "yearBuilt": 2005,
  "lotSize": 9000,
  "distanceToCityCenter": 6.0,
  "schoolRating": 8.5,
  "baselineSquareFootage": 1800
}
```

## 环境变量

- `ML_SERVICE_URL`（默认容器内：`http://ml-service:8000`）

## 文档地址

- Swagger UI: `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 本地 Docker 验证

```bash
docker compose up --build ml-service app2-java
curl http://localhost:8080/health
docker compose down
```
