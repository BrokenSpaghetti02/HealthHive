"""
Configuration management using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "HealthHive API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "healthhive"
    DB_MODE: str = "embedded"  # embedded (mongita) or mongo (atlas/local)
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:5173,http://localhost:5174"
    
    @field_validator('CORS_ORIGINS', mode='after')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Philippines Data Privacy Act Compliance
    DATA_RETENTION_YEARS: int = 5
    ENABLE_AUDIT_LOGGING: bool = True
    ENABLE_DATA_ENCRYPTION: bool = True
    
    # Sync Settings
    SYNC_BATCH_SIZE: int = 100
    SYNC_RETRY_ATTEMPTS: int = 3
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
