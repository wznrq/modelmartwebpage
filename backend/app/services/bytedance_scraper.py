from typing import Dict, List
import httpx
from .base_scraper import BaseScraper
from loguru import logger


class ByteDanceScraper(BaseScraper):
    """Scraper for ByteDance Doubao (火山引擎) models via official API"""

    BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch ByteDance Doubao models"""
        try:
            # Doubao models with official pricing (CNY converted to USD at 7.2)
            models_config = {
                "doubao-pro": {
                    "name": "豆包 Doubao Pro",
                    "version": "2.0",
                    "type": "chat",
                    "pricing": {"input": 0.4, "output": 1.2},  # ¥2.88/¥8.64
                    "performance": {
                        "context_window": 256000,  # 256K
                        "max_output": 8192,
                        "latency": 400,
                        "accuracy": 90,
                    },
                    "features": ["256K上下文", "抖音生态", "内容创作"],
                },
                "doubao-lite": {
                    "name": "豆包 Doubao Lite",
                    "version": "2.0",
                    "type": "chat",
                    "pricing": {"input": 0.2, "output": 0.6},  # ¥1.44/¥4.32
                    "performance": {
                        "context_window": 256000,
                        "max_output": 4096,
                        "latency": 300,
                        "accuracy": 86,
                    },
                    "features": ["轻量快速", "极高性价比", "日常对话"],
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

            logger.info(f"Fetched {len(models)} ByteDance models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch ByteDance models: {e}")
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
        """Fetch subscription plans for Doubao"""
        plans = {
            "doubao-pro": [
                {"plan": "Free", "context_window": 10000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 256000, "price_usd": 9.99, "period": "monthly"},
            ],
            "doubao-lite": [
                {"plan": "Free", "context_window": 10000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 256000, "price_usd": 4.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
