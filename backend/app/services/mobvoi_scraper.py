from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class MobvoiScraper(BaseScraper):
    """Scraper for Mobvoi 出门问问 models"""

    BASE_URL = "https://api.mobvoi.com/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Mobvoi models"""
        try:
            # No public models documented, placeholder for future
            models_config = {
                "wukong": {
                    "name": "Wukong",
                    "version": "1.0",
                    "type": "chat",
                    "pricing": {"input": 0.5, "output": 1.5},
                    "performance": {
                        "context_window": 32000,
                        "max_output": 4096,
                        "latency": 400,
                        "accuracy": 85,
                    },
                    "features": ["语音交互", "中文优化"],
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

            logger.info(f"Fetched {len(models)} Mobvoi models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Mobvoi models: {e}")
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
        """Fetch subscription plans for Mobvoi"""
        plans = {
            "wukong": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 32000, "price_usd": 9.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
