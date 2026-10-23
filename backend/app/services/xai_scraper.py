from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class xAIScraper(BaseScraper):
    """Scraper for xAI Grok models"""

    BASE_URL = "https://api.x.ai/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch xAI Grok models"""
        try:
            models_config = {
                "grok-4.20": {
                    "name": "Grok 4.20",
                    "version": "4.20",
                    "type": "chat",
                    "pricing": {"input": 2.0, "output": 6.0},  # USD per 1M tokens; console pricing may vary
                    "performance": {
                        "context_window": 2000000,
                        "max_output": 8192,
                        "latency": 500,
                        "accuracy": 95,
                    },
                    "features": ["最新旗舰", "推理能力", "2M上下文", "工具调用"],
                },
                "grok-4.1-fast": {
                    "name": "Grok 4.1 Fast",
                    "version": "4.1",
                    "type": "chat",
                    "pricing": {"input": 0.2, "output": 0.5},
                    "performance": {
                        "context_window": 2000000,
                        "max_output": 8192,
                        "latency": 300,
                        "accuracy": 92,
                    },
                    "features": ["快速响应", "2M上下文", "高性价比"],
                },
                "grok-4": {
                    "name": "Grok 4",
                    "version": "4.0",
                    "type": "chat",
                    "pricing": {"input": 3.0, "output": 15.0},
                    "performance": {
                        "context_window": 256000,
                        "max_output": 8192,
                        "latency": 450,
                        "accuracy": 94,
                    },
                    "features": ["推理能力", "工具调用", "多模态"],
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

            logger.info(f"Fetched {len(models)} xAI models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch xAI models: {e}")
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
        """Fetch subscription plans for xAI"""
        plans = {
            "grok-4.20": [
                {"plan": "Free", "context_window": 10000, "price_usd": 0, "period": "monthly"},
                {"plan": "Premium+", "context_window": 2000000, "price_usd": 29.99, "period": "monthly"},
            ],
            "grok-4.1-fast": [
                {"plan": "Free", "context_window": 10000, "price_usd": 0, "period": "monthly"},
                {"plan": "Premium+", "context_window": 2000000, "price_usd": 29.99, "period": "monthly"},
            ],
            "grok-4": [
                {"plan": "Free", "context_window": 10000, "price_usd": 0, "period": "monthly"},
                {"plan": "Premium", "context_window": 256000, "price_usd": 14.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
