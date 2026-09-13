"""KubeMind Backend — Application API Router."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.applications.schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationScale,
    DeploymentResponse,
)
from src.applications.service import ApplicationService
from src.core.database import get_db
from src.core.dependencies import CurrentUser

router = APIRouter(prefix="/applications", tags=["Applications"])


def get_app_service(db: AsyncSession = Depends(get_db)) -> ApplicationService:
    """Dependency to create ApplicationService instance."""
    return ApplicationService(db)


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationCreate,
    current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> ApplicationResponse:
    """Deploy a new application."""
    return await service.create(data, triggered_by=current_user.username)


@router.get("/", response_model=list[ApplicationResponse])
async def list_applications(
    _current_user: CurrentUser,
    project_id: uuid.UUID | None = Query(default=None),
    service: ApplicationService = Depends(get_app_service),
) -> list[ApplicationResponse]:
    """List all applications, optionally filtered by project."""
    return await service.get_all(project_id=project_id)


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> ApplicationResponse:
    """Get an application by ID."""
    return await service.get_by_id(app_id)


@router.post("/{app_id}/scale", response_model=ApplicationResponse)
async def scale_application(
    app_id: uuid.UUID,
    data: ApplicationScale,
    _current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> ApplicationResponse:
    """Scale application replicas."""
    return await service.scale(app_id, data)


@router.post("/{app_id}/restart", response_model=ApplicationResponse)
async def restart_application(
    app_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> ApplicationResponse:
    """Restart all pods of an application."""
    return await service.restart(app_id)


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> None:
    """Delete an application."""
    await service.delete(app_id)


@router.get("/{app_id}/deployments", response_model=list[DeploymentResponse])
async def list_deployments(
    app_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ApplicationService = Depends(get_app_service),
) -> list[DeploymentResponse]:
    """Get deployment history for an application."""
    return await service.get_deployments(app_id)
