from datetime import datetime
from loguru import logger
from ..models import SessionLocal, AIModel, DataUpdateLog
from . import celery_app


@celery_app.task(name="app.tasks.validation.validate_all_models")
def validate_all_models():
    """Validate all models data integrity"""
    db = SessionLocal()
    log_entry = DataUpdateLog(
        task_name="validate_all_models",
        status="started",
        started_at=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()

    try:
        models = db.query(AIModel).all()
        validated = 0
        errors = 0

        for model in models:
            validation_errors = _validate_model(model)
            if validation_errors:
                logger.warning(f"Validation errors for {model.id}: {validation_errors}")
                model.sync_status = "failed"
                model.sync_error = "; ".join(validation_errors)
                errors += 1
            else:
                validated += 1

        log_entry.status = "completed"
        log_entry.models_updated = validated
        log_entry.models_failed = errors
        log_entry.completed_at = datetime.utcnow()
        log_entry.duration_seconds = (
            log_entry.completed_at - log_entry.started_at
        ).total_seconds()
        db.commit()

        logger.info(f"Validation completed: {validated} valid, {errors} errors")
        return {"validated": validated, "errors": errors}

    except Exception as e:
        log_entry.status = "failed"
        log_entry.error_message = str(e)
        log_entry.completed_at = datetime.utcnow()
        db.commit()
        logger.error(f"Validation failed: {e}")
        raise


def _validate_model(model: AIModel) -> list[str]:
    """Validate a single model's data"""
    errors = []

    # Check required fields
    if not model.name:
        errors.append("Missing name")

    if not model.version:
        errors.append("Missing version")

    # Validate pricing
    if model.pricing_input < 0:
        errors.append("Invalid input pricing")

    if model.pricing_output < 0:
        errors.append("Invalid output pricing")

    # Validate performance metrics. Some non-token models do not have
    # text context/output limits.
    token_based_types = {"chat", "code", "multimodal"}
    if model.model_type in token_based_types and model.context_window <= 0:
        errors.append("Invalid context window")

    if model.model_type in token_based_types and model.max_output <= 0:
        errors.append("Invalid max output")

    if model.accuracy and (model.accuracy < 0 or model.accuracy > 100):
        errors.append("Accuracy out of range (0-100)")

    # Check data freshness
    if model.last_synced_at:
        days_since_sync = (datetime.utcnow() - model.last_synced_at).days
        if days_since_sync > 30:
            errors.append(f"Data stale ({days_since_sync} days old)")

    return errors
