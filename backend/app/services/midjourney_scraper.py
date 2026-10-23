from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class MidjourneyScraper(BaseScraper):
    """Scraper for Midjourney image generation models"""

    BASE_URL = "https://api.midjourney.com/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Midjourney models"""
        try:
            models_config = {
                "midjourney-v8.1-alpha": {
                    "name": "Midjourney V8.1 Alpha",
                    "version": "8.1-alpha",
                    "type": "image",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 0,
                        "max_output": 0,
                        "latency": 10000,
                        "accuracy": 95,
                    },
                    "features": ["艺术图像", "高保真", "创意无限"],
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

            logger.info(f"Fetched {len(models)} Midjourney models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Midjourney models: {e}")
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
        """Fetch subscription plans for Midjourney"""
        plans = {
            "midjourney-v8.1-alpha": [
                {"plan": "Free", "context_window": 0, "price_usd": 0, "period": "monthly"},
                {"plan": "Standard", "context_window": 0, "price_usd": 10.0, "period": "monthly"},
                {"plan": "Pro", "context_window": 0, "price_usd": 30.0, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
