from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime
from loguru import logger
from ..tasks.update_models import update_all_models
from ..tasks.sync_pricing import sync_all_pricing
from ..tasks.validation import validate_all_models

router = APIRouter()


class TaskTriggerResponse(BaseModel):
    status: str
    message: str
    task_id: str | None = None
    timestamp: str


@router.post("/update-models", response_model=TaskTriggerResponse)
async def trigger_model_update(background_tasks: BackgroundTasks):
    """Manually trigger model data update"""
    try:
        # Run in background to avoid blocking
        background_tasks.add_task(update_all_models)

        return TaskTriggerResponse(
            status="accepted",
            message="Model update task has been queued",
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        logger.error(f"Failed to trigger model update: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync-pricing", response_model=TaskTriggerResponse)
async def trigger_pricing_sync(background_tasks: BackgroundTasks):
    """Manually trigger pricing synchronization"""
    try:
        background_tasks.add_task(sync_all_pricing)

        return TaskTriggerResponse(
            status="accepted",
            message="Pricing sync task has been queued",
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        logger.error(f"Failed to trigger pricing sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate", response_model=TaskTriggerResponse)
async def trigger_validation(background_tasks: BackgroundTasks):
    """Manually trigger data validation"""
    try:
        background_tasks.add_task(validate_all_models)

        return TaskTriggerResponse(
            status="accepted",
            message="Validation task has been queued",
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        logger.error(f"Failed to trigger validation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_task_status():
    """Get status of scheduled tasks"""
    # In production, query Celery for task status
    return {
        "scheduled_tasks": {
            "update_all_models": {
                "schedule": "Every 24 hours",
                "last_run": "2024-01-15T02:00:00Z",
                "next_run": "2024-01-16T02:00:00Z",
                "status": "scheduled",
            },
            "sync_all_pricing": {
                "schedule": "Every 6 hours",
                "last_run": "2024-01-15T12:00:00Z",
                "next_run": "2024-01-15T18:00:00Z",
                "status": "scheduled",
            },
            "validate_all_models": {
                "schedule": "Every week",
                "last_run": "2024-01-08T00:00:00Z",
                "next_run": "2024-01-15T00:00:00Z",
                "status": "scheduled",
            },
        }
    }
