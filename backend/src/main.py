"""KubeMind Backend — FastAPI Application Entry Point.

AI-Powered Autonomous Cloud Operations Platform for Kubernetes.
"""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

from src.ai_decisions.router import router as ai_router
from src.applications.router import router as applications_router
from src.auth.router import router as auth_router
from src.clusters.router import router as clusters_router
from src.core.config import get_settings
from src.core.middleware import setup_middleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    # Startup: logging, connection checks
    yield
    # Shutdown: cleanup resources


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "KubeMind is an AI-powered autonomous cloud operations platform for Kubernetes. "
        "It provides predictive scheduling, workload forecasting, proactive failure detection, "
        "auto-remediation, cost optimization, and explainable AI insights."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS, correlation IDs, and request logging
setup_middleware(app)

# Include API v1 Routers
API_V1_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(clusters_router, prefix=API_V1_PREFIX)
app.include_router(applications_router, prefix=API_V1_PREFIX)
app.include_router(ai_router, prefix=API_V1_PREFIX)


@app.get("/", tags=["General"])
async def root() -> dict[str, Any]:
    """Root landing endpoint with system information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "docs": "/docs",
        "tagline": "Observe → Understand → Predict → Decide → Act → Measure → Learn → Improve",
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
@app.get(f"{API_V1_PREFIX}/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check() -> dict[str, Any]:
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }
