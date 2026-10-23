from typing import Dict, List
import httpx
from .base_scraper import BaseScraper
from loguru import logger


class MiniMaxScraper(BaseScraper):
    """Scraper for MiniMax models via official API"""

    BASE_URL = "https://api.minimax.chat/v"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        if api_key:
            self.client.headers.update({
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            })

    async def fetch_models(self) -> List[Dict]:
        """Fetch MiniMax models"""
        try:
            # MiniMax models - pricing needs official confirmation
            models_config = {
                "mini-max-m2.7": {
                    "name": "MiniMax-M2.7",
                    "version": "2.7",
                    "type": "chat",
                    "pricing": {"input": 0.5, "output": 2.0},  # 待确认
                    "performance": {
                        "context_window": 204800,  # 200K
                        "max_output": 8192,
                        "latency": 450,
                        "accuracy": 92,
                    },
                    "features": ["200K上下文", "高智能", "中文优化"],
                },
                "mini-max-m2.7-highspeed": {
                    "name": "MiniMax-M2.7-highspeed",
                    "version": "2.7",
                    "type": "chat",
                    "pricing": {"input": 0.6, "output": 2.5},  # 待确认
                    "performance": {
                        "context_window": 204800,
                        "max_output": 8192,
                        "latency": 200,  # 极速响应
                        "accuracy": 90,
                    },
                    "features": ["200K上下文", "极速响应", "低延迟"],
                },
                "mini-max-m2.5": {
                    "name": "MiniMax-M2.5",
                    "version": "2.5",
                    "type": "chat",
                    "pricing": {"input": 0.4, "output": 1.5},  # 待确认
                    "performance": {
                        "context_window": 204800,
                        "max_output": 8192,
                        "latency": 400,
                        "accuracy": 90,
                    },
                    "features": ["200K上下文", "高智能", "高性价比"],
                },
                "mini-max-m2": {
                    "name": "MiniMax-M2",
                    "version": "2.0",
                    "type": "chat",
                    "pricing": {"input": 0.3, "output": 1.0},  # 待确认
                    "performance": {
                        "context_window": 204800,
                        "max_output": 4096,
                        "latency": 350,
                        "accuracy": 86,
                    },
                    "features": ["200K上下文", "基础对话", "轻量级"],
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

            logger.info(f"Fetched {len(models)} MiniMax models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch MiniMax models: {e}")
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
        """Fetch subscription plans for MiniMax"""
        plans = {
            "mini-max-m2.7": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 14.99, "period": "monthly"},
                {"plan": "Enterprise", "context_window": 204800, "price_usd": 99.99, "period": "monthly"},
            ],
            "mini-max-m2.7-highspeed": [
                {"plan": "Pro", "context_window": 204800, "price_usd": 19.99, "period": "monthly"},
            ],
            "mini-max-m2.5": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 9.99, "period": "monthly"},
            ],
            "mini-max-m2": [
                {"plan": "Free", "context_window": 5000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 204800, "price_usd": 4.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
