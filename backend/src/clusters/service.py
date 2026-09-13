"""KubeMind Backend — Cluster Service."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.clusters.models import Cluster, Node
from src.clusters.schemas import ClusterCreate, ClusterResponse, ClusterUpdate, NodeResponse


class ClusterService:
    """Kubernetes cluster management service."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: ClusterCreate) -> ClusterResponse:
        """Register a new Kubernetes cluster.

        Args:
            data: Cluster registration data.

        Returns:
            The created cluster response.
        """
        cluster = Cluster(
            name=data.name,
            description=data.description,
            api_server_url=data.api_server_url,
            kubeconfig_encrypted=data.kubeconfig,  # TODO: Encrypt kubeconfig
            status="pending",
        )
        self.db.add(cluster)
        await self.db.flush()
        await self.db.refresh(cluster)
        return ClusterResponse.model_validate(cluster)

    async def get_all(self) -> list[ClusterResponse]:
        """List all registered clusters.

        Returns:
            List of cluster responses.
        """
        result = await self.db.execute(select(Cluster).order_by(Cluster.created_at.desc()))
        clusters = result.scalars().all()
        return [ClusterResponse.model_validate(c) for c in clusters]

    async def get_by_id(self, cluster_id: uuid.UUID) -> ClusterResponse:
        """Get a cluster by ID.

        Args:
            cluster_id: The cluster UUID.

        Returns:
            The cluster response.

        Raises:
            HTTPException: If cluster not found.
        """
        cluster = await self._get_cluster(cluster_id)
        return ClusterResponse.model_validate(cluster)

    async def update(self, cluster_id: uuid.UUID, data: ClusterUpdate) -> ClusterResponse:
        """Update cluster details.

        Args:
            cluster_id: The cluster UUID.
            data: Fields to update.

        Returns:
            Updated cluster response.
        """
        cluster = await self._get_cluster(cluster_id)

        if data.name is not None:
            cluster.name = data.name
        if data.description is not None:
            cluster.description = data.description

        await self.db.flush()
        await self.db.refresh(cluster)
        return ClusterResponse.model_validate(cluster)

    async def delete(self, cluster_id: uuid.UUID) -> None:
        """Delete a registered cluster.

        Args:
            cluster_id: The cluster UUID.
        """
        cluster = await self._get_cluster(cluster_id)
        await self.db.delete(cluster)

    async def get_nodes(self, cluster_id: uuid.UUID) -> list[NodeResponse]:
        """Get all nodes for a cluster.

        Args:
            cluster_id: The cluster UUID.

        Returns:
            List of node responses.
        """
        await self._get_cluster(cluster_id)  # Verify cluster exists
        result = await self.db.execute(
            select(Node).where(Node.cluster_id == cluster_id).order_by(Node.name)
        )
        nodes = result.scalars().all()
        return [NodeResponse.model_validate(n) for n in nodes]

    async def _get_cluster(self, cluster_id: uuid.UUID) -> Cluster:
        """Get cluster by ID or raise 404.

        Args:
            cluster_id: The cluster UUID.

        Returns:
            The Cluster ORM instance.

        Raises:
            HTTPException: If not found.
        """
        result = await self.db.execute(select(Cluster).where(Cluster.id == cluster_id))
        cluster = result.scalar_one_or_none()
        if not cluster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cluster {cluster_id} not found.",
            )
        return cluster
