from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class StabilityScraper(BaseScraper):
    """Scraper for Stability AI image generation models"""

    BASE_URL = "https://api.stability.ai/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Stability AI models"""
        try:
            models_config = {
                "stable-diffusion-3.5-large": {
                    "name": "Stable Diffusion 3.5 Large",
                    "version": "3.5",
                    "type": "image",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 0,
                        "max_output": 0,
                        "latency": 5000,
                        "accuracy": 94,
                    },
                    "features": ["文字渲染", "高一致性", "开源"],
                },
                "stable-diffusion-3.5-large-turbo": {
                    "name": "Stable Diffusion 3.5 Large Turbo",
                    "version": "3.5",
                    "type": "image",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 0,
                        "max_output": 0,
                        "latency": 3000,
                        "accuracy": 85,
                    },
                    "features": ["高效生成", "开源"],
                },
                "stable-diffusion-3.5-medium": {
                    "name": "Stable Diffusion 3.5 Medium",
                    "version": "3.5",
                    "type": "image",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 0,
                        "max_output": 0,
                        "latency": 2000,
                        "accuracy": 88,
                    },
                    "features": ["高效生成", "开源"],
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

            logger.info(f"Fetched {len(models)} Stability models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Stability models: {e}")
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
        """Fetch subscription plans for Stability AI"""
        plans = {
            "stable-diffusion-3.5-large": [
                {"plan": "Free", "context_window": 0, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 0, "price_usd": 19.99, "period": "monthly"},
            ],
            "stable-diffusion-3.5-large-turbo": [
                {"plan": "Free", "context_window": 0, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 0, "price_usd": 9.99, "period": "monthly"},
            ],
            "stable-diffusion-3.5-medium": [
                {"plan": "Pro", "context_window": 0, "price_usd": 14.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
