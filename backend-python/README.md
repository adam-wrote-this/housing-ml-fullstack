# backend-python

App1 Python 业务后端（FastAPI）。  
负责接收前端房源录入参数并调用 `ml-service` 获取预测结果。

## 主要职责

- 提供统一业务接口：`POST /property/predict`
- 通过 `ML_SERVICE_URL` 调用 `ml-service` 的 `/predict`
- 提供健康检查接口

## 接口

### `GET /health`

返回服务状态信息。

### `POST /property/predict`

请求体字段：

- `square_footage`
- `bedrooms`
- `bathrooms`
- `year_built`
- `lot_size`
- `distance_to_city_center`
- `school_rating`

响应包含：

- `predicted_price`
- `status`
- `message`

## 环境变量

- `ML_SERVICE_URL`（默认容器内：`http://ml-service:8000`）

## 文档地址

- Swagger UI: `http://localhost:8001/docs`

## 本地 Docker 验证

```bash
docker compose up --build ml-service app1-python
curl http://localhost:8001/health
docker compose down
```
