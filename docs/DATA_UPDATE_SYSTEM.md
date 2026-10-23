# ModelMart 定时数据更新系统

## 📋 系统概述

已实现完整的自动化数据更新系统,使用 Python + FastAPI + Celery 架构,定期从国内外 AI 模型提供商拉取最新的性能和定价数据。

## 🏗️ 技术架构

### 后端技术栈
- **FastAPI**: 高性能 REST API 框架
- **Celery**: 分布式任务队列
- **Redis**: 消息代理和结果后端
- **PostgreSQL**: 关系型数据库
- **SQLAlchemy**: ORM 数据库操作
- **httpx**: 异步 HTTP 客户端

### 定时任务调度
- **Celery Beat**: Cron 风格的定时任务调度器
- 支持自定义调度间隔
- 自动重试机制

## 📁 项目结构

```
backend/
├── app/
│   ├── main.py                 # FastAPI 应用入口
│   ├── models/
│   │   └── __init__.py         # 数据库模型 (SQLAlchemy)
│   ├── services/
│   │   ├── base_scraper.py     # 爬虫基类
│   │   ├── openai_scraper.py   # OpenAI API 抓取器
│   │   ├── anthropic_scraper.py # Anthropic API 抓取器
│   │   └── domestic_scraper.py  # 国内模型抓取器
│   ├── tasks/
│   │   ├── __init__.py         # Celery 配置和调度
│   │   ├── update_models.py    # 模型更新任务
│   │   ├── sync_pricing.py     # 定价同步任务
│   │   └── validation.py       # 数据验证任务
│   └── api/
│       ├── models.py           # 模型数据 API
│       └── tasks.py            # 任务管理 API
├── requirements.txt            # Python 依赖
├── .env.example               # 环境变量示例
├── Dockerfile                 # Docker 镜像
└── README.md                  # 后端文档

docker-compose.yml             # Docker Compose 配置
```

## ⚙️ 定时任务配置

### 1. 每日模型更新 (Daily Model Update)
- **调度**: 每 24 小时执行一次 (凌晨 2 点)
- **任务**: `update_all_models`
- **功能**:
  - 从 OpenAI API 获取最新模型
  - 从 Anthropic API 获取 Claude 模型
  - 更新国内模型数据 (百度、阿里、腾讯、智谱)
  - 记录更新日志

### 2. 定价同步 (Pricing Sync)
- **调度**: 每 6 小时执行一次
- **任务**: `sync_all_pricing`
- **功能**:
  - 验证定价数据有效性
  - 检测异常价格波动
  - 更新最后同步时间

### 3. 数据验证 (Data Validation)
- **调度**: 每周执行一次
- **任务**: `validate_all_models`
- **功能**:
  - 检查必填字段完整性
  - 验证数值范围合理性
  - 检测过期数据 (>30 天未更新)
  - 生成验证报告

## 🔌 API 端点

### 模型数据 API

```bash
# 获取所有模型
GET /api/models/
Query params:
  - provider: 过滤提供商 (可选)
  - model_type: 过滤模型类型 (可选)
  - active_only: 仅活跃模型 (默认 true)

# 获取指定模型
GET /api/models/{model_id}

# 获取更新日志
GET /api/models/updates/logs?limit=50
```

### 任务管理 API

```bash
# 手动触发模型更新
POST /api/tasks/update-models

# 手动触发定价同步
POST /api/tasks/sync-pricing

# 手动触发数据验证
POST /api/tasks/validate

# 获取任务状态
GET /api/tasks/status
```

## 🚀 快速开始

### 方法 1: Docker Compose (推荐)

```bash
# 1. 复制环境变量文件
cp backend/.env.example backend/.env

# 2. 编辑 .env 配置 API Keys
# OPENAI_API_KEY=your_key
# ANTHROPIC_API_KEY=your_key

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f backend
docker-compose logs -f celery_worker
docker-compose logs -f celery_beat
```

服务将在以下端口启动:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 方法 2: 本地开发

```bash
# 1. 安装依赖
cd backend
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 初始化数据库
python -m app.models

# 4. 启动 FastAPI (终端 1)
uvicorn app.main:app --reload --port 8000

# 5. 启动 Celery Worker (终端 2)
celery -A app.tasks.celery_app worker --loglevel=info

# 6. 启动 Celery Beat (终端 3)
celery -A app.tasks.celery_app beat --loglevel=info
```

## 🎨 前端集成

在 Models 页面集成了数据更新面板 (`DataUpdatePanel`):

**功能**:
- ✅ 显示上次更新时间
- ✅ 手动触发数据更新按钮
- ✅ 查看最近 10 条更新日志
- ✅ 显示更新状态 (成功/失败/进行中)
- ✅ 显示更新耗时和模型数量

**访问路径**: 浏览到 `/models` 页面即可看到数据更新面板

## 📊 数据流程

```
┌─────────────┐
│ Celery Beat │ (定时触发)
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Celery Task  │ (update_models)
└──────┬───────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ OpenAI   │  │Anthropic │  │ Domestic │
│  API     │  │  API     │  │ Scraper  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     └─────────────┼──────────────┘
                   ▼
          ┌────────────────┐
          │  Data Merge &  │
          │  Validation    │
          └───────┬────────┘
                  ▼
          ┌────────────────┐
          │  PostgreSQL DB │
          └───────┬────────┘
                  ▼
          ┌────────────────┐
          │  Update Logs   │
          └────────────────┘
```

## 🔑 数据源说明

### 国际提供商

| 提供商 | 数据源 | 更新频率 | API Key |
|--------|--------|----------|---------|
| OpenAI | 官方 API | 实时 | 需要 |
| Anthropic | 官方 API | 实时 | 需要 |
| Google DeepMind | 网页爬取 | 每日 | 不需要 |
| Meta AI |  curated 数据 | 每周 | 不需要 |

### 国内提供商

| 提供商 | 数据源 | 更新频率 | API Key |
|--------|--------|----------|---------|
| 百度文心 | 官网爬取 | 每日 | 不需要 |
| 阿里通义 | 官网爬取 | 每日 | 不需要 |
| 腾讯混元 | 官网爬取 | 每日 | 不需要 |
| 智谱 GLM | 官网爬取 | 每日 | 不需要 |

## 🛠️ 监控和维护

### 查看更新日志

```bash
# 通过 API
curl http://localhost:8000/api/models/updates/logs

# 通过数据库
psql -U modelmart_user -d modelmart -c "SELECT * FROM data_update_logs ORDER BY started_at DESC LIMIT 10;"
```

### 检查任务状态

```bash
# Celery Flower (可视化监控)
pip install flower
celery -A app.tasks.celery_app flower

# 访问 http://localhost:5555
```

### 手动触发更新

```bash
# 通过 API
curl -X POST http://localhost:8000/api/tasks/update-models

# 或通过前端界面点击"手动更新"按钮
```

## ⚠️ 注意事项

1. **API Keys**: 确保在 `.env` 文件中配置正确的 API Keys
2. **Rate Limiting**: 注意各提供商的 API 调用限制
3. **数据备份**: 定期备份 PostgreSQL 数据库
4. **错误处理**: 失败的更新会记录在日志中,需定期检查
5. **网络环境**: 国内模型爬取可能需要合适的网络配置

## 📈 性能优化建议

1. **数据库索引**: 为常用查询字段添加索引
2. **连接池**: 配置 SQLAlchemy 连接池
3. **缓存层**: 考虑添加 Redis 缓存热点数据
4. **批量更新**: 使用批量插入/更新减少数据库交互
5. **异步处理**: 利用 httpx 异步特性并发请求

## 🔮 未来扩展

- [ ] 添加更多模型提供商 (Mistral, Cohere 等)
- [ ] 实现价格变动通知 (邮件/Slack)
- [ ] 添加数据趋势分析图表
- [ ] 支持自定义更新调度
- [ ] 实现 A/B 测试数据对比
- [ ] 添加用户反馈机制

## 📞 技术支持

如有问题,请查看:
- Backend README: `backend/README.md`
- API 文档: http://localhost:8000/docs
- Celery 日志: `docker-compose logs -f celery_worker`
