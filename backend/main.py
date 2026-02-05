"""
HealthHive Platform - Main FastAPI Application
Offline-first chronic disease management for Jagna, Philippines
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from config import settings
from database import connect_to_mongo, close_mongo_connection

# Import routes
from routes.auth_routes import router as auth_router
from routes.patient_routes import router as patient_router
from routes.visit_routes import router as visit_router
from routes.analytics_routes import router as analytics_router
from routes.admin_routes import router as admin_router
from routes.resources_routes import router as resources_router
from routes.field_ops_routes import router as field_ops_router

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    print(f"✓ {settings.APP_NAME} v{settings.APP_VERSION} started successfully")
    yield
    # Shutdown
    await close_mongo_connection()
    print("✓ Application shutdown complete")

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Offline-first chronic disease management system for rural health workers",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(visit_router)
app.include_router(analytics_router)
app.include_router(admin_router)
app.include_router(resources_router)
app.include_router(field_ops_router)

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "description": "HealthHive API - Chronic disease management for Jagna, Philippines"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check for monitoring and Railway deployment"""
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    if settings.DEBUG:
        raise exc  # Re-raise in debug mode for full traceback
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
