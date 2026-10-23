from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/modelmart")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Provider(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo = Column(String)
    country = Column(String, nullable=False)  # 'domestic' or 'international'
    description = Column(Text)
    website = Column(String)
    api_endpoint = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    models = relationship("AIModel", back_populates="provider")


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String, primary_key=True, index=True)
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # 'chat', 'code', 'image', 'multimodal', 'audio', 'embedding', 'moderation'

    # Pricing
    pricing_input = Column(Float, nullable=False)  # CNY per 1M tokens, or provider-specific CNY unit
    pricing_output = Column(Float, nullable=False)
    currency = Column(String, default="CNY")

    # Performance
    context_window = Column(Integer, nullable=False)  # in tokens
    max_output = Column(Integer, nullable=False)
    latency = Column(Float)  # average ms
    accuracy = Column(Float)  # percentage
    throughput = Column(Float)  # tokens per second

    # Metadata
    features = Column(JSON)  # Array of features
    code_plans = Column(JSON)  # Subscription plans array
    release_date = Column(DateTime)
    last_updated = Column(DateTime, default=datetime.utcnow)
    documentation_url = Column(String)
    is_active = Column(Boolean, default=True)

    # Data source tracking
    data_source = Column(String, default="manual")  # 'api', 'scraping', 'manual'
    last_synced_at = Column(DateTime)
    sync_status = Column(String, default="pending")  # 'pending', 'success', 'failed'
    sync_error = Column(Text)

    # Relationships
    provider = relationship("Provider", back_populates="models")


class DataUpdateLog(Base):
    __tablename__ = "data_update_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'started', 'completed', 'failed'
    models_updated = Column(Integer, default=0)
    models_failed = Column(Integer, default=0)
    error_message = Column(Text)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!")
