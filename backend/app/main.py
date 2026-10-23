from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from loguru import logger
import os

from .models import init_db, SessionLocal
from .api import models, tasks

# Initialize FastAPI app
app = FastAPI(
    title="ModelMart Data Service",
    description="API service for managing AI model data updates",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    logger.info("Database initialized")
    logger.info("ModelMart Data Service started")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "modelmart-data-service",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ModelMart Data Service API",
        "docs": "/docs",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
