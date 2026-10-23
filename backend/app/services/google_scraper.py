from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class GoogleScraper(BaseScraper):
    """Scraper for Google DeepMind Gemini models"""

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)

    async def fetch_models(self) -> List[Dict]:
        """Fetch Google Gemini models"""
        try:
            # Gemini models - pricing from official documentation
            models_config = {
                "gemini-3-pro-preview": {
                    "name": "Gemini 3 Pro Preview",
                    "pricing": {"input": 2.0, "output": 12.0},  # USD per 1M tokens
                    "performance": {
                        "context_window": 1048576,
                        "max_output": 65536,
                        "latency": 600,
                        "accuracy": 97,
                    },
                    "features": ["最新旗舰模型", "百万级上下文", "多模态理解", "高级推理", "Preview"],
                },
                "gemini-3-flash-preview": {
                    "name": "Gemini 3 Flash Preview",
                    "pricing": {"input": 0.5, "output": 3.0},
                    "performance": {
                        "context_window": 1048576,
                        "max_output": 65536,
                        "latency": 260,
                        "accuracy": 94,
                    },
                    "features": ["快速响应", "百万级上下文", "多模态理解"],
                },
                "gemini-3-pro-image-preview": {
                    "name": "Gemini 3 Pro Image Preview",
                    "pricing": {"input": 2.0, "output": 12.0},
                    "performance": {
                        "context_window": 65536,
                        "max_output": 32768,
                        "latency": 1200,
                        "accuracy": 95,
                    },
                    "features": ["图像生成", "多模态理解", "高质量"],
                },
                "gemini-2.5-pro": {
                    "name": "Gemini 2.5 Pro",
                    "pricing": {"input": 1.25, "output": 10.0},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 8192,
                        "latency": 550,
                        "accuracy": 94,
                    },
                    "features": ["高性能", "百万级上下文", "多模态理解"],
                },
                "gemini-2.5-flash": {
                    "name": "Gemini 2.5 Flash",
                    "pricing": {"input": 0.3, "output": 2.5},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 8192,
                        "latency": 300,
                        "accuracy": 90,
                    },
                    "features": ["高性价比", "快速响应", "日常使用"],
                },
            }

            models = []
            for model_id, config in models_config.items():
                models.append({
                    "id": model_id,
                    "name": config["name"],
                    "version": "latest",
                    "type": "multimodal" if "pro" in model_id else "chat",
                    "pricing": config["pricing"],
                    "performance": config["performance"],
                    "features": config["features"],
                })

            logger.info(f"Fetched {len(models)} Google models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Google models: {e}")
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
        """Fetch subscription plans for Gemini models"""
        # Gemini subscription tiers
        plans = {
            "gemini-3-pro-preview": [
                {"plan": "Standard", "context_window": 128000, "price_usd": 0, "period": "monthly"},
                {"plan": "Advanced", "context_window": 1000000, "price_usd": 19.99, "period": "monthly"},
            ],
            "gemini-2.5-pro": [
                {"plan": "Standard", "context_window": 128000, "price_usd": 0, "period": "monthly"},
                {"plan": "Advanced", "context_window": 1000000, "price_usd": 19.99, "period": "monthly"},
            ],
            "gemini-2.5-flash": [
                {"plan": "Free", "context_window": 128000, "price_usd": 0, "period": "monthly"},
                {"plan": "Pro", "context_window": 1000000, "price_usd": 9.99, "period": "monthly"},
            ],
        }
        return plans.get(model_id, [])

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
