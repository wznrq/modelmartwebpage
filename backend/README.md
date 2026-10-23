# ModelMart Backend - Data Update Service

Python + FastAPI + Celery backend service for automatically fetching and updating AI model data.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  FastAPI     │────▶│  PostgreSQL │
│  (React)    │◀────│  REST API    │◀────│  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Celery     │
                    │  Task Queue  │
                    └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ OpenAI   │ │Anthropic │ │ Domestic │
        │   API    │ │   API    │ │Scraper   │
        └──────────┘ └──────────┘ └──────────┘
```

## Features

- ✅ **Automated Data Updates**: Scheduled tasks to fetch latest model data
- ✅ **Multiple Data Sources**: Official APIs + web scraping
- ✅ **Data Validation**: Automatic validation and error detection
- ✅ **Manual Triggers**: API endpoints for on-demand updates
- ✅ **Update Logs**: Track all data update operations
- ✅ **RESTful API**: FastAPI endpoints for frontend integration

## Setup

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Redis (for Celery)

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)

### 4. Initialize Database

```bash
python -m app.models
```

### 5. Start Services

**Terminal 1 - FastAPI Server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Celery Worker:**
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

**Terminal 3 - Celery Beat (Scheduler):**
```bash
celery -A app.tasks.celery_app beat --loglevel=info
```

## API Endpoints

### Models
- `GET /api/models/` - Get all models
- `GET /api/models/{id}` - Get specific model
- `GET /api/models/updates/logs` - Get update logs

### Tasks
- `POST /api/tasks/update-models` - Trigger manual model update
- `POST /api/tasks/sync-pricing` - Trigger pricing sync
- `POST /api/tasks/validate` - Trigger data validation
- `GET /api/tasks/status` - Get scheduled task status

### Health
- `GET /health` - Health check
- `GET /` - API info

## Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Update All Models | Every 24 hours (2 AM) | Fetch latest model data from all sources |
| Sync Pricing | Every 6 hours | Update pricing information |
| Validate Models | Every week | Validate data integrity |

## Data Sources

### International Providers
- **OpenAI**: Official API (requires API key)
- **Anthropic**: Official API (requires API key)
- **Google DeepMind**: Web scraping
- **Meta AI**: Curated data

### Domestic (Chinese) Providers
- **Baidu Wenxin**: Web scraping / curated
- **Alibaba Qwen**: Web scraping / curated
- **Tencent Hunyuan**: Web scraping / curated
- **Zhipu GLM**: Web scraping / curated

## Development

### Running Tests
```bash
pytest tests/ -v
```

### Code Formatting
```bash
black app/
isort app/
```

### Database Migrations
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Monitoring

Check update logs via API:
```bash
curl http://localhost:8000/api/models/updates/logs
```

Or view Celery worker logs in real-time.

## Production Deployment

For production, consider:
- Use Gunicorn with Uvicorn workers
- Set up proper logging and monitoring
- Configure Redis Sentinel for high availability
- Use connection pooling for database
- Set up SSL/TLS for API endpoints
- Implement rate limiting
- Add authentication for admin endpoints
