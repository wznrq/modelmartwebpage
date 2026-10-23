from typing import Dict, List
from .base_scraper import BaseScraper
from loguru import logger


class OpenAIScraper(BaseScraper):
    """Scraper for OpenAI models using official API"""

    BASE_URL = "https://api.openai.com/v1"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    async def fetch_models(self) -> List[Dict]:
        """Fetch all available OpenAI models"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/models")
            response.raise_for_status()
            data = response.json()

            models = []
            for model_data in data.get("data", []):
                # Filter for GPT models only
                if "gpt" in model_data["id"].lower():
                    model_info = await self._get_model_details(model_data["id"])
                    if model_info:
                        models.append(model_info)

            logger.info(f"Fetched {len(models)} OpenAI models")
            return models

        except Exception as e:
            logger.error(f"Failed to fetch OpenAI models: {e}")
            return []

    async def _get_model_details(self, model_id: str) -> Dict:
        """Get detailed information for a specific model"""
        # OpenAI doesn't provide pricing via API, use hardcoded mapping
        pricing_map = {
            "gpt-5.4": {"input": 2.5, "output": 15.0},
            "gpt-5.4-pro": {"input": 30.0, "output": 180.0},
            "gpt-5.4-mini": {"input": 0.75, "output": 4.5},
            "gpt-5.4-nano": {"input": 0.2, "output": 1.25},
            "gpt-5.2": {"input": 1.75, "output": 14.0},
            "gpt-5.1": {"input": 1.25, "output": 10.0},
            "gpt-5": {"input": 1.25, "output": 10.0},
            "gpt-5-mini": {"input": 0.25, "output": 2.0},
            "gpt-5-nano": {"input": 0.05, "output": 0.4},
            "gpt-5-chat-latest": {"input": 1.25, "output": 10.0},
            "gpt-5.2-codex": {"input": 1.75, "output": 14.0},
            "gpt-5-pro": {"input": 15.0, "output": 120.0},
            "gpt-5.2-pro": {"input": 21.0, "output": 168.0},
            "gpt-4.1": {"input": 2.0, "output": 8.0},
            "gpt-4.1-mini": {"input": 0.4, "output": 1.6},
            "gpt-realtime": {"input": 4.0, "output": 16.0},
            "gpt-audio": {"input": 2.5, "output": 10.0},
            "gpt-4o": {"input": 2.5, "output": 10.0},
            "gpt-4-turbo": {"input": 10.0, "output": 30.0},
            "gpt-4": {"input": 30.0, "output": 60.0},
            "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
        }

        performance_map = {
            "gpt-4o": {
                "context_window": 128000,
                "max_output": 16384,
                "latency": 450,
                "accuracy": 95,
            },
            "gpt-4-turbo": {
                "context_window": 128000,
                "max_output": 4096,
                "latency": 600,
                "accuracy": 93,
            },
            "gpt-4": {
                "context_window": 8192,
                "max_output": 8192,
                "latency": 800,
                "accuracy": 92,
            },
            "gpt-3.5-turbo": {
                "context_window": 16385,
                "max_output": 4096,
                "latency": 300,
                "accuracy": 85,
            },
        }

        pricing = pricing_map.get(model_id, {"input": 1.0, "output": 2.0})
        performance = performance_map.get(model_id, {
            "context_window": 8192,
            "max_output": 4096,
            "latency": 500,
            "accuracy": 85,
        })

        return {
            "id": model_id,
            "name": model_id.upper(),
            "version": "latest",
            "type": "chat",
            "pricing": pricing,
            "performance": performance,
            "features": ["多语言支持", "代码生成", "函数调用"],
        }

    async def fetch_pricing(self, model_id: str) -> Dict:
        """Fetch pricing for specific model"""
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["pricing"] if model else {}

    async def fetch_performance(self, model_id: str) -> Dict:
        """Fetch performance metrics for specific model"""
        models = await self.fetch_models()
        model = next((m for m in models if m["id"] == model_id), None)
        return model["performance"] if model else {}
