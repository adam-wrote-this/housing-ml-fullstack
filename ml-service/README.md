# ML Service

房价预测推理服务，基于 FastAPI、scikit-learn `LinearRegression`、pandas 和 joblib。它是两个业务后端共享的底层服务，不承载房源录入或市场分析等业务逻辑。

## 服务职责

- 从 CSV 读取训练数据，按 8:2 划分训练集与测试集。
- 镜像构建期间训练模型并生成 `/app/model.joblib`。
- 启动时加载模型、指标和特征顺序。
- 提供单条/批量推理、模型信息和健康检查接口。

调用关系：

```text
app1-python ─┐
             ├─> ml-service:8000 ─> model.joblib
app2-java ───┘
```

## 模型与数据

模型输入字段按以下固定顺序训练和推理：

| 字段 | 含义 |
|---|---|
| `square_footage` | 房屋面积（平方英尺） |
| `bedrooms` | 卧室数量 |
| `bathrooms` | 浴室数量 |
| `year_built` | 建造年份 |
| `lot_size` | 地块面积（平方英尺） |
| `distance_to_city_center` | 距市中心距离（英里） |
| `school_rating` | 学校评分 |

训练时会删除可选的 `id` 列和含空值的记录，目标列为 `price`。模型产物同时保存特征列表及 `r2_score`、`rmse`、`mse`、`mae` 指标。

Compose 将 `docs/House Price Dataset.csv` 只读挂载到 `/app/shared/housing.csv`。Dockerfile 构建镜像时也会复制该数据集用于模型训练。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/health` | 服务状态和模型加载状态 |
| `POST` | `/predict` | 单条或批量价格预测 |
| `GET` | `/model-info` | 模型系数、截距、特征和评估指标 |
| `GET` | `/docs` | Swagger UI |

### 单条预测

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2}'
```

响应：

```json
{
  "predictions": 312345.67,
  "status": "success",
  "message": "Single prediction completed"
}
```

### 批量预测

请求体直接使用数组；响应中的 `predictions` 也是等长数组。

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '[{"square_footage":1850,"bedrooms":3,"bathrooms":2,"year_built":1998,"lot_size":7500,"distance_to_city_center":5.6,"school_rating":8.2},{"square_footage":2100,"bedrooms":4,"bathrooms":2.5,"year_built":2005,"lot_size":9200,"distance_to_city_center":7.3,"school_rating":8.5}]'
```

空数组或数据格式错误返回 `422`；模型未加载时预测和模型信息接口返回 `503`。

## 环境变量

| 变量 | Compose 值 | 说明 |
|---|---|---|
| `DATASET_PATH` | `/app/shared/housing.csv` | 训练数据路径 |
| `PYTHONUNBUFFERED` | `1` | 实时输出 Python 日志 |

## Docker 运行与验证

在仓库根目录执行：

```bash
docker compose up -d --build ml-service
curl http://localhost:8000/health
curl http://localhost:8000/model-info
docker compose logs ml-service
docker compose down
```

当前 Compose 将 `8000` 发布到宿主机，因此 Swagger UI 位于 `http://localhost:8000/docs`。容器间调用必须使用 `http://ml-service:8000`，不能使用 `localhost`。

运行 API 自动化测试需要本机 Python 依赖和已经启动的服务：

```bash
cd ml-service
python test_api.py
```

## 关键文件

| 文件 | 作用 |
|---|---|
| `train.py` | 加载数据、训练和保存模型 |
| `main.py` | FastAPI 生命周期及接口 |
| `schemas.py` | 请求与响应模型 |
| `utils.py` | 模型加载和特征排序 |
| `Dockerfile` | 安装依赖、构建模型并启动服务 |

## 常见问题

- `/health` 返回 `model_loaded: false`：检查容器日志中的模型加载错误以及 `model.joblib` 是否存在。
- 构建阶段提示找不到数据集：确认 `docs/House Price Dataset.csv` 存在，且构建上下文是仓库根目录。
- 后端无法连接：确认使用 `ML_SERVICE_URL=http://ml-service:8000`，并检查 `docker compose ps` 中的健康状态。
