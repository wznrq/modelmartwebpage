from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..models import SessionLocal, AIModel, Provider, DataUpdateLog
from loguru import logger

router = APIRouter()


class ModelResponse(BaseModel):
    id: str
    providerId: str
    name: str
    version: str
    type: str
    pricing: dict
    currency: str
    performance: dict
    features: list[str]
    releaseDate: Optional[str]
    lastUpdated: Optional[str]


@router.get("/", response_model=List[ModelResponse])
async def get_models(
    provider: Optional[str] = Query(None, description="Filter by provider ID"),
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    active_only: bool = Query(True, description="Only return active models"),
):
    """Get all models with optional filtering"""
    db = SessionLocal()
    try:
        query = db.query(AIModel)

        if active_only:
            query = query.filter(AIModel.is_active == True)

        if provider:
            query = query.filter(AIModel.provider_id == provider)

        if model_type:
            query = query.filter(AIModel.model_type == model_type)

        models = query.all()

        return [
            ModelResponse(
                id=model.id,
                providerId=model.provider_id,
                name=model.name,
                version=model.version,
                type=model.model_type,
                pricing={
                    "input": model.pricing_input,
                    "output": model.pricing_output,
                },
                currency=model.currency or "CNY",
                performance={
                    "contextWindow": model.context_window,
                    "maxOutput": model.max_output,
                    "latency": model.latency,
                    "accuracy": model.accuracy,
                },
                features=model.features or [],
                releaseDate=model.release_date.isoformat() if model.release_date else None,
                lastUpdated=model.last_updated.isoformat() if model.last_updated else None,
            )
            for model in models
        ]
    finally:
        db.close()


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(model_id: str):
    """Get a specific model by ID"""
    db = SessionLocal()
    try:
        model = db.query(AIModel).filter(AIModel.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        return ModelResponse(
            id=model.id,
            providerId=model.provider_id,
            name=model.name,
            version=model.version,
            type=model.model_type,
            pricing={
                "input": model.pricing_input,
                "output": model.pricing_output,
            },
            currency=model.currency or "CNY",
            performance={
                "contextWindow": model.context_window,
                "maxOutput": model.max_output,
                "latency": model.latency,
                "accuracy": model.accuracy,
            },
            features=model.features or [],
            releaseDate=model.release_date.isoformat() if model.release_date else None,
            lastUpdated=model.last_updated.isoformat() if model.last_updated else None,
        )
    finally:
        db.close()


@router.get("/updates/logs")
async def get_update_logs(limit: int = Query(50, ge=1, le=500)):
    """Get data update logs"""
    db = SessionLocal()
    try:
        logs = (
            db.query(DataUpdateLog)
            .order_by(DataUpdateLog.started_at.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "id": log.id,
                "task_name": log.task_name,
                "status": log.status,
                "models_updated": log.models_updated,
                "models_failed": log.models_failed,
                "error_message": log.error_message,
                "started_at": log.started_at.isoformat(),
                "completed_at": log.completed_at.isoformat() if log.completed_at else None,
                "duration_seconds": log.duration_seconds,
            }
            for log in logs
        ]
    finally:
        db.close()
