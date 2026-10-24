# ModelMart.ai

AI Model Discovery & Comparison Platform

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **State Management**: Zustand
- **Data Collection**: Python 3 single-file scraper (`scripts/scrape_models.py`)
- **Deployment**: Cloudflare Pages (GitHub Actions)

## Project Structure

```
├── src/              # Frontend source code
│   ├── components/   # UI components
│   ├── pages/        # Page components
│   ├── data/         # Static data (models, benchmarks)
│   ├── stores/       # Zustand stores
│   └── i18n/         # Internationalization
├── scripts/          # Build & data collection scripts
├── data/             # Scraped snapshots
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

# Scrape latest model pricing and diff against src/data/models.ts
npm run scrape:models
# or: python scripts/scrape_models.py --diff
```

抓取脚本为零第三方依赖的单文件 Python 脚本，输出：

- `data/llm-stats/models.scraped.json` — 归一化后的模型数据（价格已按汇率换算为 CNY / 百万 token）
- `data/llm-stats/price-diff.json` — 与现有 `src/data/models.ts` 的价格差异，供人工核对后更新

## Documentation

- [Model Data Sources](docs/MODEL_SOURCES.md)
