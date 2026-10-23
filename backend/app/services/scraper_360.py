from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class Scraper360(BaseScraper):
    """Scraper for 360 智脑 models"""

    BASE_URL = "https://ai.360.cn/api/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch 360 智脑 models"""
        try:
            models_config = {
                "360 brain-6": {
                    "name": "360 智脑大模型 6.0",
                    "version": "6.0",
                    "type": "chat",
                    "pricing": {"input": 0.6, "output": 2.0},  # USD per 1M tokens (¥4.32/¥14.4)
                    "performance": {
                        "context_window": 128000,
                        "max_output": 8192,
                        "latency": 450,
                        "accuracy": 88,
                    },
                    "features": ["安全大脑", "搜索增强", "中文优化"],
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

            logger.info(f"Fetched {len(models)} 360 models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch 360 models: {e}")
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
        """Fetch subscription plans for 360"""
        plans = {
            "360 brain-6": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 128000, "price_usd": 9.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
