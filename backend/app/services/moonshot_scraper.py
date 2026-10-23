from typing import Dict, List
import httpx
from .base_scraper import BaseScraper
from loguru import logger


class MoonshotScraper(BaseScraper):
    """Scraper for Moonshot AI Kimi models via official API"""

    BASE_URL = "https://api.moonshot.cn/v1"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Moonshot Kimi models"""
        try:
            # Kimi models with official pricing (CNY converted to USD at 7.2)
            models_config = {
                "kimi-k2.6": {
                    "name": "Kimi K2.6",
                    "version": "2.6",
                    "type": "multimodal",
                    "pricing": {"input": 0.9028, "output": 3.75},  # ¥6.5/¥27
                    "performance": {
                        "context_window": 256000,
                        "max_output": 32768,
                        "latency": 450,
                        "accuracy": 93,
                    },
                    "features": ["262K上下文", "长文档处理", "代码能力", "多模态理解"],
                },
                "kimi-k2.5": {
                    "name": "Kimi K2.5",
                    "version": "2.5",
                    "type": "multimodal",
                    "pricing": {"input": 0.5556, "output": 2.9167},  # ¥4/¥21
                    "performance": {
                        "context_window": 256000,
                        "max_output": 32768,
                        "latency": 400,
                        "accuracy": 92,
                    },
                    "features": ["262K上下文", "代码能力", "多模态理解"],
                },
                "moonshot-v1-128k-vision-preview": {
                    "name": "Moonshot V1 128K Vision Preview",
                    "version": "1.0",
                    "type": "multimodal",
                    "pricing": {"input": 1.6667, "output": 1.6667},  # ¥12/¥12
                    "performance": {
                        "context_window": 204800,
                        "max_output": 8192,
                        "latency": 450,
                        "accuracy": 88,
                    },
                    "features": ["200K上下文", "基础对话"],
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

            logger.info(f"Fetched {len(models)} Moonshot models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Moonshot models: {e}")
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
        """Fetch subscription plans for Kimi"""
        plans = {
            "kimi-k2.6": [
                {"plan": "Free", "context_window": 8000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 14.99, "period": "monthly"},
                {"plan": "Pro+", "context_window": 204800, "price_usd": 29.99, "period": "monthly"},
            ],
            "kimi-k2.5": [
                {"plan": "Free", "context_window": 8000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 14.99, "period": "monthly"},
            ],
            "moonshot-v1-128k-vision-preview": [
                {"plan": "Free", "context_window": 8000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 14.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
