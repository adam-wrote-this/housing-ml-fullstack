# Python Business Backend

App1 房源录入业务后端，基于 FastAPI、Pydantic 和 httpx。它负责校验前端请求、调用 ML 服务，并将底层 `predictions` 响应转换为业务字段 `predicted_price`。

## 架构位置

```text
Browser -> Next.js /api/python/* -> app1-python:8001 -> ml-service:8000
```

浏览器通常通过 Next.js 同源代理访问该服务。Compose 也将 `8001` 发布到宿主机，便于独立调试。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/health` | 业务服务健康检查，不探测 ML 可用性 |
| `POST` | `/property/predict` | 校验七项房屋特征并请求 ML 预测 |
| `GET` | `/docs` | Swagger UI |

### 房价预测

```bash
curl -X POST http://localhost:8001/property/predict \
	-H "Content-Type: application/json" \
	-d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'
```

请求字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `square_footage` | number | 房屋面积（平方英尺） |
| `bedrooms` | number | 卧室数量 |
| `bathrooms` | number | 浴室数量 |
| `year_built` | number | 建造年份 |
| `lot_size` | number | 地块面积（平方英尺） |
| `distance_to_city_center` | number | 距市中心距离（英里） |
| `school_rating` | number | 学校评分 |

成功响应：

```json
{
	"predicted_price": 312345.67,
	"status": "success",
	"message": "Price prediction successful"
}
```

错误语义：

| HTTP 状态 | 场景 |
|---|---|
| `422` | 缺少字段或字段类型不合法，由 Pydantic 返回 |
| `503` | ML 连接失败、超时、返回非 2xx 或响应无法解析 |

ML 请求超时为 10 秒。服务会将上游异常转换为 JSON `detail`，自身不会退出。

## 环境变量

| 变量 | Compose 值 | 宿主机直接运行默认值 | 说明 |
|---|---|---|---|
| `ML_SERVICE_URL` | `http://ml-service:8000` | `http://localhost:8000` | ML 服务基础地址 |
| `PYTHONUNBUFFERED` | `1` | 未设置 | 实时输出 Python 日志 |

Docker 容器中的 `localhost` 指向容器自身，因此 Compose 环境必须使用服务名 `ml-service`。

## Docker 运行与验证

在仓库根目录执行：

```bash
docker compose up -d --build ml-service app1-python
curl http://localhost:8001/health
curl -X POST http://localhost:8001/property/predict \
	-H "Content-Type: application/json" \
	-d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'
docker compose logs app1-python
docker compose down
```

Swagger UI：`http://localhost:8001/docs`。

## 上游故障验证

```bash
docker compose stop ml-service
curl -X POST http://localhost:8001/property/predict \
	-H "Content-Type: application/json" \
	-d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'
```

预期返回 HTTP `503`。完成后运行 `docker compose start ml-service` 恢复依赖。

## 关键文件

| 文件 | 作用 |
|---|---|
| `main.py` | FastAPI 应用、路由和异常转换 |
| `client.py` | 异步 ML HTTP 客户端 |
| `schemas.py` | 业务请求与响应模型 |
| `Dockerfile` | 容器构建与启动配置 |

## 常见问题

- 返回 `503`：先检查 `curl http://localhost:8000/health`，再查看 `docker compose logs ml-service app1-python`。
- 容器日志出现无法解析 `ml-service`：确认两个服务由同一个 Compose 项目启动。
- 返回 `422`：对照 Swagger 检查七个 snake_case 字段是否完整且为数字。
