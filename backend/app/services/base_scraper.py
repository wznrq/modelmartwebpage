from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from datetime import datetime
import httpx
from loguru import logger


class BaseScraper(ABC):
    """Base class for all data scrapers"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)
        logger.info(f"Initialized {self.__class__.__name__}")

    @abstractmethod
    async def fetch_models(self) -> List[Dict]:
        """Fetch model data from source"""
        pass

    @abstractmethod
    async def fetch_pricing(self, model_id: str) -> Dict:
        """Fetch pricing information for a specific model"""
        pass

    @abstractmethod
    async def fetch_performance(self, model_id: str) -> Dict:
        """Fetch performance metrics for a specific model"""
        pass

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    def _normalize_model_data(self, raw_data: Dict) -> Dict:
        """Normalize raw data to standard format"""
        return {
            "id": raw_data.get("id"),
            "name": raw_data.get("name"),
            "version": raw_data.get("version", "1.0"),
            "pricing": {
                "input": raw_data.get("pricing", {}).get("input", 0),
                "output": raw_data.get("pricing", {}).get("output", 0),
            },
            "currency": raw_data.get("currency", "USD"),
            "performance": {
                "context_window": raw_data.get("performance", {}).get("context_window", 0),
                "max_output": raw_data.get("performance", {}).get("max_output", 0),
                "latency": raw_data.get("performance", {}).get("latency"),
                "accuracy": raw_data.get("performance", {}).get("accuracy"),
            },
            "features": raw_data.get("features", []),
            "last_updated": datetime.utcnow().isoformat(),
        }
