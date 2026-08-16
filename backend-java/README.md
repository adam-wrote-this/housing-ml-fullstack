# Java Market Backend

App2 市场分析后端，基于 Java 21、Spring Boot、WebClient、Reactor、Spring Cache 和 Caffeine。它读取房价数据集生成市场看板，并通过非阻塞 HTTP 调用 ML 服务执行 What-if 仿真。

## 架构位置

```text
Browser -> Next.js /api/java/* -> app2-java:8080
                                      ├─> housing.csv
                                      └─> ml-service:8000
```

市场看板和分段直接读取 Java 管理的数据集；只有 What-if 预测调用 ML 服务。

## API

| 方法 | 路径 | 说明 | 是否调用 ML |
|---|---|---|---|
| `GET` | `/health` | 服务健康检查 | 否 |
| `GET` | `/market/segments` | 三个价格区间的统计数据 | 否 |
| `GET` | `/market/dashboard` | 汇总指标、分段和完整房源列表 | 否 |
| `POST` | `/market/whatif` | 房源场景仿真 | 是 |
| `GET` | `/docs` | Swagger UI | 否 |

价格分段固定为 `Under $200k`、`$200k - $350k` 和 `Over $350k`。

### Dashboard

```bash
curl http://localhost:8080/market/dashboard
```

响应由三部分组成：

```json
{
  "summary": {
    "totalProperties": 100,
    "averagePrice": 300000.0,
    "medianPrice": 295000.0,
    "averageSquareFootage": 1800.0,
    "averageSchoolRating": 7.5,
    "minPrice": 150000.0,
    "maxPrice": 500000.0
  },
  "segments": [],
  "properties": []
}
```

### What-if：基于已有房源

推荐前端使用 `propertyId + overrides`。未出现在 `overrides` 中的字段沿用原房源值；响应包含基准预测、场景预测、差值、百分比和各字段独立影响。

```bash
curl -X POST http://localhost:8080/market/whatif \
  -H "Content-Type: application/json" \
  -d '{"propertyId":1,"overrides":{"squareFootage":2100,"schoolRating":9}}'
```

### What-if：完整特征兼容协议

现有 API 客户端也可直接提交七项 camelCase 特征。可选的 `baselineSquareFootage` 用于额外计算基准价格和差值。

```bash
curl -X POST http://localhost:8080/market/whatif \
  -H "Content-Type: application/json" \
  -d '{"squareFootage":2000,"bedrooms":4,"bathrooms":2.5,"yearBuilt":2005,"lotSize":9000,"distanceToCityCenter":6.0,"schoolRating":8.5,"baselineSquareFootage":1800}'
```

错误语义：不存在的 `propertyId`、缺少 `overrides`、场景值越界或兼容协议缺字段返回 `400`；ML 调用失败返回 `503`。

## 异步 HTTP 调用

What-if 链路从 Controller 到 ML Client 全程返回 Reactor `Mono`：

```text
MarketController -> Mono<ResponseEntity<?>>
MarketService    -> Mono<WhatIfResponseDto>
MlClientService  -> WebClient -> Mono<Double/List<Double>>
```

生产代码不调用 `.block()`。WebClient 等待 ML 响应时不会占用 Servlet 请求线程；Spring MVC 会订阅 `Mono` 并在结果到达后异步完成响应。兼容协议需要场景价和基准价时使用 `Mono.zip` 并发请求。What-if 的 Caffeine 缓存启用了 async cache mode，以支持 `@Cacheable` 的响应式返回值。

## 数据与缓存

Compose 将 `docs/House Price Dataset.csv` 只读挂载到 `/app/shared/housing.csv`。服务为以下计算启用 Caffeine 缓存：

- 市场分段。
- Dashboard 聚合。
- What-if 预测。

缓存默认最多 1000 条，写入 15 分钟后过期。数据集变更后应重启 Java 服务以重新加载并清空缓存。

## 环境变量

| 变量 | Compose 值 | 默认值 | 说明 |
|---|---|---|---|
| `ML_SERVICE_URL` | `http://ml-service:8000` | `http://localhost:8000` | ML 服务地址 |
| `ML_CONNECT_TIMEOUT` | `2s` | `2s` | 建立 ML 连接的最大等待时间 |
| `ML_RESPONSE_TIMEOUT` | `10s` | `10s` | 等待 ML 响应的最大时间 |
| `DATASET_PATH` | `/app/shared/housing.csv` | `../docs/House Price Dataset.csv` | CSV 数据集路径 |
| `CACHE_MAXIMUM_SIZE` | `1000` | `1000` | 缓存最大条目数 |
| `CACHE_EXPIRE_AFTER_WRITE` | `15m` | `15m` | 写入后的过期时间 |

## Docker 运行与验证

在仓库根目录执行：

```bash
docker compose up -d --build ml-service app2-java
curl http://localhost:8080/health
curl http://localhost:8080/market/segments
curl http://localhost:8080/market/dashboard
docker compose logs app2-java
docker compose down
```

- Swagger UI：`http://localhost:8080/docs`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

## 测试

使用本地 Java 21 与 Maven：

```bash
cd backend-java
mvn test
```

测试覆盖数据集加载、市场统计、缓存以及 What-if 服务逻辑。Dockerfile 在构建阶段执行 `mvn package -DskipTests`，因此单元测试应单独运行。

## 目录结构

```text
src/main/java/com/property/
├── config/       # WebClient、超时、CORS 与缓存配置
├── controller/   # HTTP API 和异常映射
├── dto/          # API 与 ML 数据契约
├── model/        # CSV 房源记录
└── service/      # 数据集、市场统计和 ML 客户端
```

## 常见问题

- 启动时报数据集不存在：检查 `DATASET_PATH` 和 Compose 的只读挂载。
- What-if 返回 `503`：检查 ML 健康状态和 `ML_SERVICE_URL`，再查看 `docker compose logs app2-java ml-service`。
- 修改 CSV 后页面数据未变化：重启 `app2-java` 以重新加载数据并清空缓存。
- What-if 返回 `400`：确认使用 camelCase 字段，并检查 `propertyId` 是否来自 Dashboard 返回的房源列表。
