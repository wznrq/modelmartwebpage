from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class AnthropicScraper(BaseScraper):
    """Scraper for Anthropic Claude models"""

    BASE_URL = "https://api.anthropic.com/v1"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client.headers.update({
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        })

    async def fetch_models(self) -> List[Dict]:
        """Fetch Claude models"""
        try:
            # Anthropic doesn't have a public models endpoint
            # Use known model list with updated pricing
            models_config = {
                "claude-opus-4-7": {
                    "name": "Claude Opus 4.7",
                    "pricing": {"input": 5.0, "output": 25.0},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 128000,
                        "latency": 800,
                        "accuracy": 98,
                    },
                    "features": ["最新旗舰", "最高智能", "复杂推理", "多模态理解"],
                },
                "claude-opus-4-6": {
                    "name": "Claude Opus 4.6",
                    "pricing": {"input": 5.0, "output": 25.0},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 128000,
                        "latency": 900,
                        "accuracy": 97,
                    },
                    "features": ["最高智能", "顶级推理", "复杂分析", "代码能力"],
                },
                "claude-sonnet-4-6": {
                    "name": "Claude Sonnet 4.6",
                    "pricing": {"input": 3.0, "output": 15.0},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 64000,
                        "latency": 480,
                        "accuracy": 96,
                    },
                    "features": ["平衡性能", "快速响应", "高性价比", "代码能力"],
                },
                "claude-haiku-4-5-20251001": {
                    "name": "Claude Haiku 4.5",
                    "pricing": {"input": 1.0, "output": 5.0},
                    "performance": {
                        "context_window": 200000,
                        "max_output": 64000,
                        "latency": 220,
                        "accuracy": 92,
                    },
                    "features": ["极速响应", "高性价比", "轻量级", "代码能力"],
                },
                "claude-sonnet-4-5-20250929": {
                    "name": "Claude Sonnet 4.5",
                    "pricing": {"input": 3.0, "output": 15.0},
                    "performance": {
                        "context_window": 1000000,
                        "max_output": 64000,
                        "latency": 500,
                        "accuracy": 95,
                    },
                    "features": ["平衡性能", "快速响应", "高性价比", "高级推理"],
                },
            }

            models = []
            for model_id, config in models_config.items():
                models.append({
                    "id": model_id,
                    "name": config["name"],
                    "version": "latest",
                    "type": "chat",
                    "pricing": config["pricing"],
                    "performance": config["performance"],
                    "features": config["features"],
                })

            logger.info(f"Fetched {len(models)} Anthropic models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch Anthropic models: {e}")
            return []

    async def fetch_pricing(self, model_id: str) -> Dict:
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["pricing"] if model else {}

    async def fetch_performance(self, model_id: str) -> Dict:
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["performance"] if model else {}
