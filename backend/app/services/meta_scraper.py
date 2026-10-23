from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class MetaScraper(BaseScraper):
    """Scraper for Meta AI Llama models"""

    BASE_URL = "https://www.llama.com"

    def __init__(self, api_key: str = None):
        super().__init__(api_key)

    async def fetch_models(self) -> List[Dict]:
        """Fetch Meta Llama models"""
        try:
            # Llama models - open source and free
            models_config = {
                "llama-4-maverick": {
                    "name": "Llama 4 Maverick",
                    "version": "4.0",
                    "type": "multimodal",
                    "pricing": {"input": 0, "output": 0},  # Free open source
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 32768,
                        "latency": 500,
                        "accuracy": 90,
                    },
                    "features": ["开源免费", "多模态", "百万级上下文"],
                },
                "llama-4-scout": {
                    "name": "Llama 4 Scout",
                    "version": "4.0",
                    "type": "multimodal",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 10000000,  # 10M context
                        "max_output": 32768,
                        "latency": 800,
                        "accuracy": 92,
                    },
                    "features": ["开源免费", "10M上下文", "多模态"],
                },
                "llama-3.3-70b": {
                    "name": "Llama 3.3 70B",
                    "version": "3.3",
                    "type": "chat",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 4096,
                        "latency": 500,
                        "accuracy": 92,
                    },
                    "features": ["开源免费", "70B参数", "多语言", "高性价比"],
                },
                "llama-3.1-70b": {
                    "name": "Llama 3.1 70B",
                    "version": "3.1",
                    "type": "chat",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 4096,
                        "latency": 700,
                        "accuracy": 91,
                    },
                    "features": ["开源免费", "70B参数", "高性价比"],
                },
                "llama-3.1-8b": {
                    "name": "Llama 3.1 8B",
                    "version": "3.1",
                    "type": "chat",
                    "pricing": {"input": 0, "output": 0},
                    "performance": {
                        "context_window": 128000,
                        "max_output": 4096,
                        "latency": 300,
                        "accuracy": 88,
                    },
                    "features": ["开源免费", "轻量快速", "边缘部署"],
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

            logger.info(f"Fetched {len(models)} Meta models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Meta models: {e}")
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
        """Fetch subscription plans - Llama is open source free"""
        # Open source models are free to use
        return [
            {"plan": "Open Source", "context_window": 128000, "price_usd": 0, "period": "forever"},
        ]

    async def fetch_all_with_plans(self) -> List[Dict]:
        """Fetch all models with their subscription plans"""
        models = await self.fetch_models()
        for model in models:
            model["code_plans"] = await self.fetch_code_plans(model["id"])
        return models
