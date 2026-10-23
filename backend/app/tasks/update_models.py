from celery import Task
from datetime import datetime
from loguru import logger
from ..models import SessionLocal, AIModel, Provider, DataUpdateLog
from ..services.openai_scraper import OpenAIScraper
from ..services.anthropic_scraper import AnthropicScraper
from ..services.domestic_scraper import DomesticModelsScraper
from ..services.google_scraper import GoogleScraper
from ..services.meta_scraper import MetaScraper
from ..services.deepseek_scraper import DeepSeekScraper
from ..services.moonshot_scraper import MoonshotScraper
from ..services.bytedance_scraper import ByteDanceScraper
from ..services.minimax_scraper import MiniMaxScraper
from ..services.mistral_scraper import MistralScraper
from ..services.xai_scraper import xAIScraper
from ..services.perplexity_scraper import PerplexityScraper
from ..services.sensetime_scraper import SenseTimeScraper
from ..services.iflytek_scraper import iFlytekScraper
from ..services.scraper_360 import Scraper360
from ..services.huawei_scraper import HuaweiScraper
from ..services.mobvoi_scraper import MobvoiScraper
from ..services.stability_scraper import StabilityScraper
from ..services.runway_scraper import RunwayScraper
from ..services.midjourney_scraper import MidjourneyScraper
from . import celery_app
import os

CNY_PER_USD = 7.2


class ModelUpdateTask(Task):
    """Base task for model updates"""

    def on_success(self, retval, task_id, args, kwargs):
        logger.info(f"Task {task_id} completed successfully")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {exc}")


@celery_app.task(name="app.tasks.update_models.update_all_models", base=ModelUpdateTask)
def update_all_models():
    """Main task to update all models from various sources"""
    db = SessionLocal()
    log_entry = DataUpdateLog(
        task_name="update_all_models",
        status="started",
        started_at=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()

    try:
        total_updated = 0
        total_failed = 0

        # Update OpenAI models
        logger.info("Updating OpenAI models...")
        openai_updated, openai_failed = _update_openai_models(db)
        total_updated += openai_updated
        total_failed += openai_failed

        # Update Anthropic models
        logger.info("Updating Anthropic models...")
        anthropic_updated, anthropic_failed = _update_anthropic_models(db)
        total_updated += anthropic_updated
        total_failed += anthropic_failed

        # Update domestic models
        logger.info("Updating domestic models...")
        domestic_updated, domestic_failed = _update_domestic_models(db)
        total_updated += domestic_updated
        total_failed += domestic_failed

        # Update Google models
        logger.info("Updating Google models...")
        google_updated, google_failed = _update_google_models(db)
        total_updated += google_updated
        total_failed += google_failed

        # Update Meta models
        logger.info("Updating Meta models...")
        meta_updated, meta_failed = _update_meta_models(db)
        total_updated += meta_updated
        total_failed += meta_failed

        # Update DeepSeek models
        logger.info("Updating DeepSeek models...")
        deepseek_updated, deepseek_failed = _update_deepseek_models(db)
        total_updated += deepseek_updated
        total_failed += deepseek_failed

        # Update Moonshot models
        logger.info("Updating Moonshot models...")
        moonshot_updated, moonshot_failed = _update_moonshot_models(db)
        total_updated += moonshot_updated
        total_failed += moonshot_failed

        # Update ByteDance models
        logger.info("Updating ByteDance models...")
        bytedance_updated, bytedance_failed = _update_bytedance_models(db)
        total_updated += bytedance_updated
        total_failed += bytedance_failed

        # Update MiniMax models
        logger.info("Updating MiniMax models...")
        minimax_updated, minimax_failed = _update_minimax_models(db)
        total_updated += minimax_updated
        total_failed += minimax_failed

        # Update Mistral models
        logger.info("Updating Mistral models...")
        mistral_updated, mistral_failed = _update_mistral_models(db)
        total_updated += mistral_updated
        total_failed += mistral_failed

        # Update xAI models
        logger.info("Updating xAI models...")
        xai_updated, xai_failed = _update_xai_models(db)
        total_updated += xai_updated
        total_failed += xai_failed

        # Update Perplexity models
        logger.info("Updating Perplexity models...")
        perplexity_updated, perplexity_failed = _update_perplexity_models(db)
        total_updated += perplexity_updated
        total_failed += perplexity_failed

        # Update SenseTime models
        logger.info("Updating SenseTime models...")
        sensetime_updated, sensetime_failed = _update_sensetime_models(db)
        total_updated += sensetime_updated
        total_failed += sensetime_failed

        # Update iFlytek models
        logger.info("Updating iFlytek models...")
        iflytek_updated, iflytek_failed = _update_iflytek_models(db)
        total_updated += iflytek_updated
        total_failed += iflytek_failed

        # Update 360 models
        logger.info("Updating 360 models...")
        _360_updated, _360_failed = _update_360_models(db)
        total_updated += _360_updated
        total_failed += _360_failed

        # Update Huawei models
        logger.info("Updating Huawei models...")
        huawei_updated, huawei_failed = _update_huawei_models(db)
        total_updated += huawei_updated
        total_failed += huawei_failed

        # Update Mobvoi models
        logger.info("Updating Mobvoi models...")
        mobvoi_updated, mobvoi_failed = _update_mobvoi_models(db)
        total_updated += mobvoi_updated
        total_failed += mobvoi_failed

        # Update Stability models
        logger.info("Updating Stability models...")
        stability_updated, stability_failed = _update_stability_models(db)
        total_updated += stability_updated
        total_failed += stability_failed

        # Update Runway models
        logger.info("Updating Runway models...")
        runway_updated, runway_failed = _update_runway_models(db)
        total_updated += runway_updated
        total_failed += runway_failed

        # Update Midjourney models
        logger.info("Updating Midjourney models...")
        midjourney_updated, midjourney_failed = _update_midjourney_models(db)
        total_updated += midjourney_updated
        total_failed += midjourney_failed

        # Update log
        log_entry.status = "completed"
        log_entry.models_updated = total_updated
        log_entry.models_failed = total_failed
        log_entry.completed_at = datetime.utcnow()
        log_entry.duration_seconds = (
            log_entry.completed_at - log_entry.started_at
        ).total_seconds()
        db.commit()

        logger.info(
            f"Model update completed: {total_updated} updated, {total_failed} failed"
        )
        return {"updated": total_updated, "failed": total_failed}

    except Exception as e:
        log_entry.status = "failed"
        log_entry.error_message = str(e)
        log_entry.completed_at = datetime.utcnow()
        db.commit()
        logger.error(f"Model update failed: {e}")
        raise


def _update_openai_models(db) -> tuple[int, int]:
    """Update OpenAI models"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OpenAI API key not configured, skipping")
            return 0, 0

        scraper = OpenAIScraper(api_key)
        models_data = scraper.fetch_models_sync()  # Sync version for Celery

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "openai", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update OpenAI model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"OpenAI update error: {e}")
        return 0, 1


def _update_anthropic_models(db) -> tuple[int, int]:
    """Update Anthropic models"""
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.warning("Anthropic API key not configured, skipping")
            return 0, 0

        scraper = AnthropicScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "anthropic", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Anthropic model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Anthropic update error: {e}")
        return 0, 1


def _update_domestic_models(db) -> tuple[int, int]:
    """Update domestic (Chinese) models"""
    try:
        scraper = DomesticModelsScraper()
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                provider_id = model_data.pop("provider_id")
                _upsert_model(db, provider_id, model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update domestic model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Domestic models update error: {e}")
        return 0, 1


def _update_google_models(db) -> tuple[int, int]:
    """Update Google DeepMind models"""
    try:
        scraper = GoogleScraper()
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "google", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Google model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Google models update error: {e}")
        return 0, 1


def _update_meta_models(db) -> tuple[int, int]:
    """Update Meta AI models"""
    try:
        scraper = MetaScraper()
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "meta", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Meta model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Meta models update error: {e}")
        return 0, 1


def _update_deepseek_models(db) -> tuple[int, int]:
    """Update DeepSeek models"""
    try:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            logger.warning("DeepSeek API key not configured, skipping")
            return 0, 0

        scraper = DeepSeekScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "deepseek", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update DeepSeek model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"DeepSeek models update error: {e}")
        return 0, 1


def _update_moonshot_models(db) -> tuple[int, int]:
    """Update Moonshot AI Kimi models"""
    try:
        api_key = os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            logger.warning("Moonshot API key not configured, skipping")
            return 0, 0

        scraper = MoonshotScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "moonshot", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Moonshot model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Moonshot models update error: {e}")
        return 0, 1


def _update_bytedance_models(db) -> tuple[int, int]:
    """Update ByteDance Doubao models"""
    try:
        api_key = os.getenv("BYTEDANCE_API_KEY")
        if not api_key:
            logger.warning("ByteDance API key not configured, skipping")
            return 0, 0

        scraper = ByteDanceScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "bytedance", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update ByteDance model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"ByteDance models update error: {e}")
        return 0, 1


def _update_minimax_models(db) -> tuple[int, int]:
    """Update MiniMax models"""
    try:
        api_key = os.getenv("MINIMAX_API_KEY")
        if not api_key:
            logger.warning("MiniMax API key not configured, skipping")
            return 0, 0

        scraper = MiniMaxScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "minimax", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update MiniMax model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"MiniMax models update error: {e}")
        return 0, 1


def _update_mistral_models(db) -> tuple[int, int]:
    """Update Mistral AI models"""
    try:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            logger.warning("Mistral API key not configured, skipping")
            return 0, 0

        scraper = MistralScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "mistral", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Mistral model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Mistral models update error: {e}")
        return 0, 1


def _update_xai_models(db) -> tuple[int, int]:
    """Update xAI Grok models"""
    try:
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            logger.warning("xAI API key not configured, skipping")
            return 0, 0

        scraper = xAIScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "xai", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update xAI model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"xAI models update error: {e}")
        return 0, 1


def _update_perplexity_models(db) -> tuple[int, int]:
    """Update Perplexity AI models"""
    try:
        api_key = os.getenv("PERPLEXITY_API_KEY")
        if not api_key:
            logger.warning("Perplexity API key not configured, skipping")
            return 0, 0

        scraper = PerplexityScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "perplexity", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Perplexity model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Perplexity models update error: {e}")
        return 0, 1


def _update_sensetime_models(db) -> tuple[int, int]:
    """Update SenseTime models"""
    try:
        api_key = os.getenv("SENSETIME_API_KEY")
        if not api_key:
            logger.warning("SenseTime API key not configured, skipping")
            return 0, 0

        scraper = SenseTimeScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "sensetime", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update SenseTime model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"SenseTime models update error: {e}")
        return 0, 1


def _update_iflytek_models(db) -> tuple[int, int]:
    """Update iFlytek models"""
    try:
        api_key = os.getenv("IFLYTEK_API_KEY")
        if not api_key:
            logger.warning("iFlytek API key not configured, skipping")
            return 0, 0

        scraper = iFlytekScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "iflytek", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update iFlytek model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"iFlytek models update error: {e}")
        return 0, 1


def _update_360_models(db) -> tuple[int, int]:
    """Update 360 智脑 models"""
    try:
        api_key = os.getenv("360_API_KEY")
        if not api_key:
            logger.warning("360 API key not configured, skipping")
            return 0, 0

        scraper = Scraper360(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "360", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update 360 model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"360 models update error: {e}")
        return 0, 1


def _update_huawei_models(db) -> tuple[int, int]:
    """Update Huawei models"""
    try:
        api_key = os.getenv("HUAWEI_API_KEY")
        if not api_key:
            logger.warning("Huawei API key not configured, skipping")
            return 0, 0

        scraper = HuaweiScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "huawei", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Huawei model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Huawei models update error: {e}")
        return 0, 1


def _update_mobvoi_models(db) -> tuple[int, int]:
    """Update Mobvoi models"""
    try:
        api_key = os.getenv("MOBVOI_API_KEY")
        if not api_key:
            logger.warning("Mobvoi API key not configured, skipping")
            return 0, 0

        scraper = MobvoiScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "mobvoi", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Mobvoi model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Mobvoi models update error: {e}")
        return 0, 1


def _update_stability_models(db) -> tuple[int, int]:
    """Update Stability AI models"""
    try:
        api_key = os.getenv("STABILITY_API_KEY")
        if not api_key:
            logger.warning("Stability API key not configured, skipping")
            return 0, 0

        scraper = StabilityScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "stability", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Stability model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Stability models update error: {e}")
        return 0, 1


def _update_runway_models(db) -> tuple[int, int]:
    """Update Runway models"""
    try:
        api_key = os.getenv("RUNWAY_API_KEY")
        if not api_key:
            logger.warning("Runway API key not configured, skipping")
            return 0, 0

        scraper = RunwayScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "runway", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Runway model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Runway models update error: {e}")
        return 0, 1


def _update_midjourney_models(db) -> tuple[int, int]:
    """Update Midjourney models"""
    try:
        api_key = os.getenv("MIDJOURNEY_API_KEY")
        if not api_key:
            logger.warning("Midjourney API key not configured, skipping")
            return 0, 0

        scraper = MidjourneyScraper(api_key)
        models_data = scraper.fetch_models_sync()

        updated = 0
        failed = 0

        for model_data in models_data:
            try:
                _upsert_model(db, "midjourney", model_data)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to update Midjourney model {model_data.get('id')}: {e}")
                failed += 1

        return updated, failed

    except Exception as e:
        logger.error(f"Midjourney models update error: {e}")
        return 0, 1


def _upsert_model(db, provider_id: str, model_data: dict):
    """Insert or update a model in the database"""
    existing = db.query(AIModel).filter(AIModel.id == model_data["id"]).first()
    pricing = _normalize_pricing_to_cny(model_data)

    if existing:
        # Update existing model
        existing.name = model_data.get("name", existing.name)
        existing.version = model_data.get("version", existing.version)
        existing.pricing_input = pricing.get("input", existing.pricing_input)
        existing.pricing_output = pricing.get("output", existing.pricing_output)
        existing.currency = "CNY"
        existing.context_window = model_data.get("performance", {}).get("context_window", existing.context_window)
        existing.max_output = model_data.get("performance", {}).get("max_output", existing.max_output)
        existing.latency = model_data.get("performance", {}).get("latency", existing.latency)
        existing.accuracy = model_data.get("performance", {}).get("accuracy", existing.accuracy)
        existing.features = model_data.get("features", existing.features)
        existing.code_plans = model_data.get("code_plans", existing.code_plans)
        existing.last_updated = datetime.utcnow()
        existing.last_synced_at = datetime.utcnow()
        existing.sync_status = "success"
    else:
        # Create new model
        new_model = AIModel(
            id=model_data["id"],
            provider_id=provider_id,
            name=model_data["name"],
            version=model_data.get("version", "1.0"),
            model_type=model_data.get("type", "chat"),
            pricing_input=pricing.get("input", 0),
            pricing_output=pricing.get("output", 0),
            currency="CNY",
            context_window=model_data.get("performance", {}).get("context_window", 0),
            max_output=model_data.get("performance", {}).get("max_output", 0),
            latency=model_data.get("performance", {}).get("latency"),
            accuracy=model_data.get("performance", {}).get("accuracy"),
            features=model_data.get("features", []),
            code_plans=model_data.get("code_plans", []),
            data_source="api",
            last_synced_at=datetime.utcnow(),
            sync_status="success",
        )
        db.add(new_model)

    db.commit()


def _normalize_pricing_to_cny(model_data: dict) -> dict:
    """Normalize scraper prices to CNY before persistence.

    Most provider scrapers keep official USD prices. Curated domestic data can
    set currency='CNY' to opt out of conversion.
    """
    pricing = model_data.get("pricing", {})
    currency = model_data.get("currency", "USD")
    input_price = pricing.get("input", 0) or 0
    output_price = pricing.get("output", 0) or 0

    if currency == "CNY":
        return {"input": input_price, "output": output_price}

    if currency == "USD":
        return {
            "input": round(input_price * CNY_PER_USD, 4),
            "output": round(output_price * CNY_PER_USD, 4),
        }

    logger.warning(f"Unknown currency {currency}, storing pricing as CNY without conversion")
    return {"input": input_price, "output": output_price}


# Make sync versions available for Celery (which doesn't support async)
def fetch_models_sync(self):
    import asyncio
    return asyncio.run(self.fetch_models())

OpenAIScraper.fetch_models_sync = fetch_models_sync
AnthropicScraper.fetch_models_sync = fetch_models_sync
DomesticModelsScraper.fetch_models_sync = fetch_models_sync
GoogleScraper.fetch_models_sync = fetch_models_sync
MetaScraper.fetch_models_sync = fetch_models_sync
DeepSeekScraper.fetch_models_sync = fetch_models_sync
MoonshotScraper.fetch_models_sync = fetch_models_sync
ByteDanceScraper.fetch_models_sync = fetch_models_sync
MiniMaxScraper.fetch_models_sync = fetch_models_sync
MistralScraper.fetch_models_sync = fetch_models_sync
xAIScraper.fetch_models_sync = fetch_models_sync
PerplexityScraper.fetch_models_sync = fetch_models_sync
SenseTimeScraper.fetch_models_sync = fetch_models_sync
iFlytekScraper.fetch_models_sync = fetch_models_sync
Scraper360.fetch_models_sync = fetch_models_sync
HuaweiScraper.fetch_models_sync = fetch_models_sync
MobvoiScraper.fetch_models_sync = fetch_models_sync
StabilityScraper.fetch_models_sync = fetch_models_sync
RunwayScraper.fetch_models_sync = fetch_models_sync
MidjourneyScraper.fetch_models_sync = fetch_models_sync
