"""KubeMind Backend — Cluster Pydantic Schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ---- Request Schemas ----


class ClusterCreate(BaseModel):
    """Create a new cluster registration."""

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    api_server_url: str = Field(min_length=1, max_length=500)
    kubeconfig: str = Field(description="Base64-encoded kubeconfig")


class ClusterUpdate(BaseModel):
    """Update cluster details."""

    name: str | None = None
    description: str | None = None


# ---- Response Schemas ----


class ClusterResponse(BaseModel):
    """Cluster data response."""

    id: uuid.UUID
    name: str
    description: str | None
    api_server_url: str
    status: str
    health_score: float | None
    last_synced_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class NodeResponse(BaseModel):
    """Node data response."""

    id: uuid.UUID
    cluster_id: uuid.UUID
    name: str
    status: str | None
    role: str | None
    cpu_capacity: float | None
    memory_capacity_mb: float | None
    cpu_usage: float | None
    memory_usage_mb: float | None
    disk_usage_percent: float | None
    failure_risk: float
    last_heartbeat: datetime | None

    model_config = {"from_attributes": True}


class ClusterHealthResponse(BaseModel):
    """Cluster health summary."""

    cluster_id: uuid.UUID
    health_score: float | None
    total_nodes: int
    ready_nodes: int
    total_pods: int
    running_pods: int
    pending_pods: int
    cpu_utilization: float
    memory_utilization: float
    failure_risk: str
    last_synced_at: datetime | None
