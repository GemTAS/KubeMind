"""KubeMind Backend — Cluster API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.clusters.schemas import ClusterCreate, ClusterResponse, ClusterUpdate, NodeResponse
from src.clusters.service import ClusterService
from src.core.database import get_db
from src.core.dependencies import CurrentUser

router = APIRouter(prefix="/clusters", tags=["Clusters"])


def get_cluster_service(db: AsyncSession = Depends(get_db)) -> ClusterService:
    """Dependency to create ClusterService instance."""
    return ClusterService(db)


@router.post("/", response_model=ClusterResponse, status_code=status.HTTP_201_CREATED)
async def create_cluster(
    data: ClusterCreate,
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> ClusterResponse:
    """Register a new Kubernetes cluster."""
    return await service.create(data)


@router.get("/", response_model=list[ClusterResponse])
async def list_clusters(
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> list[ClusterResponse]:
    """List all registered clusters."""
    return await service.get_all()


@router.get("/{cluster_id}", response_model=ClusterResponse)
async def get_cluster(
    cluster_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> ClusterResponse:
    """Get a cluster by ID."""
    return await service.get_by_id(cluster_id)


@router.patch("/{cluster_id}", response_model=ClusterResponse)
async def update_cluster(
    cluster_id: uuid.UUID,
    data: ClusterUpdate,
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> ClusterResponse:
    """Update cluster details."""
    return await service.update(cluster_id, data)


@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cluster(
    cluster_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> None:
    """Delete a registered cluster."""
    await service.delete(cluster_id)


@router.get("/{cluster_id}/nodes", response_model=list[NodeResponse])
async def list_nodes(
    cluster_id: uuid.UUID,
    _current_user: CurrentUser,
    service: ClusterService = Depends(get_cluster_service),
) -> list[NodeResponse]:
    """List all nodes in a cluster."""
    return await service.get_nodes(cluster_id)
