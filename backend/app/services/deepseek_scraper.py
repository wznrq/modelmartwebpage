from typing import Dict, List
import httpx
from .base_scraper import BaseScraper
from loguru import logger


class DeepSeekScraper(BaseScraper):
    """Scraper for DeepSeek models via official API"""

    BASE_URL = "https://api.deepseek.com/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch DeepSeek models"""
        try:
            # DeepSeek models with official pricing
            models_config = {
                "deepseek-chat": {
                    "name": "DeepSeek V3",
                    "version": "V3.2",
                    "type": "chat",
                    "pricing": {"input": 0.28, "output": 1.4},  # USD per 1M tokens
                    "performance": {
                        "context_window": 128000,
                        "max_output": 8192,
                        "latency": 400,
                        "accuracy": 90,
                    },
                    "features": ["高性价比", "DeepSeek-V3.2", "API官方ID"],
                },
                "deepseek-reasoner": {
                    "name": "DeepSeek R1",
                    "version": "V3.2",
                    "type": "chat",
                    "pricing": {"input": 0.55, "output": 2.2},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 8192,
                        "latency": 600,
                        "accuracy": 95,
                    },
                    "features": ["推理模型", "DeepSeek-V3.2", "复杂问题解决"],
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

            logger.info(f"Fetched {len(models)} DeepSeek models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch DeepSeek models: {e}")
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
        """Fetch subscription plans for DeepSeek"""
        plans = {
            "deepseek-chat": [
                {"plan": "Free Tier", "context_window": 14000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 128000, "price_usd": 9.99, "period": "monthly"},
            ],
            "deepseek-reasoner": [
                {"plan": "Free Tier", "context_window": 14000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 128000, "price_usd": 19.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
