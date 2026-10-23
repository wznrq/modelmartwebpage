from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# Celery Configuration
celery_app = Celery(
    "modelmart",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2"),
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    
    # Task routing
    task_routes={
        "app.tasks.update_models.*": {"queue": "model_updates"},
        "app.tasks.sync_pricing.*": {"queue": "pricing_updates"},
    },
    
    # Retry settings
    task_retry_backoff=True,
    task_retry_backoff_max=600,
    task_max_retries=3,
)

# Beat Schedule (Cron-like scheduling)
celery_app.conf.beat_schedule = {
    "update-all-models-daily": {
        "task": "app.tasks.update_models.update_all_models",
        "schedule": 86400.0,  # Every 24 hours
        "options": {"expires": 3600},
    },
    "sync-pricing-every-6-hours": {
        "task": "app.tasks.sync_pricing.sync_all_pricing",
        "schedule": 21600.0,  # Every 6 hours
        "options": {"expires": 1800},
    },
    "validate-models-weekly": {
        "task": "app.tasks.validation.validate_all_models",
        "schedule": 604800.0,  # Every week
        "options": {"expires": 7200},
    },
}

from . import update_models, sync_pricing, validation

__all__ = ["celery_app"]
