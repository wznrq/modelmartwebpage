from datetime import datetime
from loguru import logger
from ..models import SessionLocal, AIModel, DataUpdateLog
from . import celery_app


@celery_app.task(name="app.tasks.sync_pricing.sync_all_pricing")
def sync_all_pricing():
    """Sync pricing information for all models"""
    db = SessionLocal()
    log_entry = DataUpdateLog(
        task_name="sync_all_pricing",
        status="started",
        started_at=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()

    try:
        # Get all active models
        models = db.query(AIModel).filter(AIModel.is_active == True).all()

        updated = 0
        failed = 0

        for model in models:
            try:
                # In production, fetch fresh pricing from APIs
                # For now, we'll validate existing pricing
                _validate_pricing(model)
                updated += 1
            except Exception as e:
                logger.error(f"Failed to sync pricing for {model.id}: {e}")
                model.sync_status = "failed"
                model.sync_error = str(e)
                failed += 1

        # Update log
        log_entry.status = "completed"
        log_entry.models_updated = updated
        log_entry.models_failed = failed
        log_entry.completed_at = datetime.utcnow()
        log_entry.duration_seconds = (
            log_entry.completed_at - log_entry.started_at
        ).total_seconds()
        db.commit()

        logger.info(f"Pricing sync completed: {updated} updated, {failed} failed")
        return {"updated": updated, "failed": failed}

    except Exception as e:
        log_entry.status = "failed"
        log_entry.error_message = str(e)
        log_entry.completed_at = datetime.utcnow()
        db.commit()
        logger.error(f"Pricing sync failed: {e}")
        raise


def _validate_pricing(model: AIModel):
    """Validate and update pricing if needed"""
    # Check if pricing is reasonable
    if model.pricing_input < 0 or model.pricing_output < 0:
        raise ValueError(f"Invalid pricing for {model.id}")

    # Check for significant price changes (>50%)
    # In production, compare with cached previous values
    model.last_synced_at = datetime.utcnow()
    model.sync_status = "success"
