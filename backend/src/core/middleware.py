"""KubeMind Backend — Middleware Configuration.

CORS, request logging, and global error handling.
"""

import logging
import time
import uuid

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import get_settings

logger = logging.getLogger("kubemind")
settings = get_settings()


def setup_middleware(app: FastAPI) -> None:
    """Configure all middleware for the FastAPI application.

    Args:
        app: The FastAPI application instance.
    """
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next) -> Response:  # type: ignore[no-untyped-def]
        """Log all incoming requests with timing and correlation ID."""
        request_id = str(uuid.uuid4())[:8]
        start_time = time.perf_counter()

        # Add request ID to state
        request.state.request_id = request_id

        logger.info(
            "→ %s %s [%s]",
            request.method,
            request.url.path,
            request_id,
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration = (time.perf_counter() - start_time) * 1000
            logger.error(
                "✗ %s %s [%s] %.1fms — %s",
                request.method,
                request.url.path,
                request_id,
                duration,
                str(exc),
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An unexpected error occurred.",
                        "request_id": request_id,
                    }
                },
            )

        duration = (time.perf_counter() - start_time) * 1000
        logger.info(
            "← %s %s [%s] %d %.1fms",
            request.method,
            request.url.path,
            request_id,
            response.status_code,
            duration,
        )

        response.headers["X-Request-ID"] = request_id
        return response
