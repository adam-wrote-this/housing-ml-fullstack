# ml-service

房价预测 ML 服务（FastAPI + sklearn LinearRegression）。

## 主要职责

- 读取 `housing.csv` 训练线性回归模型
- 构建镜像时自动生成 `model.joblib`
- 提供推理与模型信息接口

## 接口

### `GET /health`
返回服务状态与模型加载状态。

### `POST /predict`
支持单条对象和批量数组预测。

请求示例（单条）：

```json
{
  "square_footage": 1850,
  "bedrooms": 3,
  "bathrooms": 2,
  "year_built": 1998,
  "lot_size": 7500,
  "distance_to_city_center": 5.6,
  "school_rating": 8.2
}
```

### `GET /model-info`
返回模型系数、截距、特征列表、评估指标（R2/RMSE/MSE/MAE）。

## 文档地址

- Swagger UI: `http://localhost:8000/docs`

## 本地 Docker 验证

```bash
docker compose up --build ml-service
curl http://localhost:8000/health
docker compose down
```
