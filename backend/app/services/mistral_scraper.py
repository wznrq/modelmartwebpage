from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class MistralScraper(BaseScraper):
    """Scraper for Mistral AI models"""

    BASE_URL = "https://api.mistral.ai/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Mistral AI models"""
        try:
            models_config = {
                "mistral-small-4": {
                    "name": "Mistral Small 4",
                    "version": "26.03",
                    "type": "multimodal",
                    "pricing": {"input": 0.15, "output": 0.6},  # USD per 1M tokens
                    "performance": {
                        "context_window": 256000,
                        "max_output": 32768,
                        "latency": 260,
                        "accuracy": 91,
                    },
                    "features": ["开源", "256K上下文", "多模态", "高性价比"],
                },
                "mistral-large-3": {
                    "name": "Mistral Large 3",
                    "version": "25.12",
                    "type": "multimodal",
                    "pricing": {"input": 0.5, "output": 1.5},
                    "performance": {
                        "context_window": 256000,
                        "max_output": 32768,
                        "latency": 420,
                        "accuracy": 94,
                    },
                    "features": ["开源", "256K上下文", "多模态", "顶级推理"],
                },
                "mistral-medium-3.1": {
                    "name": "Mistral Medium 3.1",
                    "version": "3.1",
                    "type": "chat",
                    "pricing": {"input": 0.4, "output": 2.0},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 32768,
                        "latency": 400,
                        "accuracy": 90,
                    },
                    "features": ["高性价比", "快速响应", "通用场景", "多模态"],
                },
                "leanstral": {
                    "name": "Leanstral",
                    "version": "26.03",
                    "type": "code",
                    "pricing": {"input": 0, "output": 0},  # Free
                    "performance": {
                        "context_window": 256000,
                        "max_output": 32768,
                        "latency": 320,
                        "accuracy": 89,
                    },
                    "features": ["开源", "代码生成", "256K上下文", "高性价比"],
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

            logger.info(f"Fetched {len(models)} Mistral models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Mistral models: {e}")
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
        """Fetch subscription plans for Mistral"""
        plans = {
            "mistral-small-4": [
                {"plan": "Free", "context_window": 8000, "price_usd": 0, "period": "monthly"},
                {"plan": "Open Source", "context_window": 256000, "price_usd": 0, "period": "forever"},
            ],
            "mistral-large-3": [
                {"plan": "Open Source", "context_window": 256000, "price_usd": 0, "period": "forever"},
            ],
            "mistral-medium-3.1": [
                {"plan": "Free", "context_window": 8000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 128000, "price_usd": 9.99, "period": "monthly"},
            ],
            "leanstral": [
                {"plan": "Open Source", "context_window": 256000, "price_usd": 0, "period": "forever"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
