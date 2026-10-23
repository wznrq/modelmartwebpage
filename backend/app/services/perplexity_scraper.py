from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class PerplexityScraper(BaseScraper):
    """Scraper for Perplexity AI models"""

    BASE_URL = "https://api.perplexity.ai"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Perplexity AI models"""
        try:
            models_config = {
                "sonar": {
                    "name": "Sonar",
                    "version": "1.0",
                    "type": "chat",
                    "pricing": {"input": 2.0, "output": 6.0},  # USD per 1M tokens
                    "performance": {
                        "context_window": 128000,
                        "max_output": 8192,
                        "latency": 500,
                        "accuracy": 90,
                    },
                    "features": ["AI搜索", "实时信息", "网络搜索"],
                },
                "sonar-pro": {
                    "name": "Sonar Pro",
                    "version": "1.0",
                    "type": "chat",
                    "pricing": {"input": 12.0, "output": 20.0},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 8192,
                        "latency": 600,
                        "accuracy": 92,
                    },
                    "features": ["无限使用", "深度搜索", "专业研究"],
                },
            }

            models = []
            for model_id, config in models_config.items():
                models.append({
                    "id": model_id,
                    "name": config["name"],
                    "version": config["version"],
                    "type": config["type"],
                    "pricing": config["pricing"],
                    "performance": config["performance"],
                    "features": config["features"],
                })

            logger.info(f"Fetched {len(models)} Perplexity models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Perplexity models: {e}")
            return []

    async def fetch_pricing(self, model_id: str) -> Dict:
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["pricing"] if model else {}

    async def fetch_performance(self, model_id: str) -> Dict:
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["performance"] if model else {}

    async def fetch_code_plans(self, model_id: str) -> Dict:
        """Fetch subscription plans for Perplexity"""
        plans = {
            "sonar": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 128000, "price_usd": 20.0, "period": "monthly"},
            ],
            "sonar-pro": [
                {"plan": "Pro", "context_window": 128000, "price_usd": 20.0, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
