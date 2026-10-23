# ModelMart.ai

AI Model Discovery & Comparison Platform

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **State Management**: Zustand
- **Backend**: FastAPI + PostgreSQL + Redis/Celery
- **Deployment**: Cloudflare Pages

## Project Structure

```
├── src/              # Frontend source code
│   ├── components/   # UI components
│   ├── pages/        # Page components
│   ├── data/         # Static data (models, benchmarks)
│   ├── stores/       # Zustand stores
│   ├── hooks/        # Custom hooks
│   └── i18n/         # Internationalization
├── backend/           # Python backend service
├── docs/             # Documentation
└── public/           # Static assets
```

## Getting Started

```bash
# Install dependencies
npm install

# Start frontend development server
npm run dev

# Build for production
npm run build

# Optional: point frontend admin panels at a backend API
VITE_API_BASE_URL=http://localhost:8000 npm run dev

# Start backend services
docker compose up backend postgres redis celery_worker celery_beat
```

## Documentation

- [Model Data Sources](docs/MODEL_SOURCES.md)
- [Data Update System](docs/DATA_UPDATE_SYSTEM.md)
