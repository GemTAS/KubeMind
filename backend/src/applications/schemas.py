"""KubeMind Backend — Application Pydantic Schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ---- Request Schemas ----


class ApplicationCreate(BaseModel):
    """Create a new application deployment."""

    name: str = Field(min_length=1, max_length=255)
    project_id: uuid.UUID
    cluster_id: uuid.UUID
    image: str = Field(min_length=1, max_length=500)
    namespace: str = "default"
    replicas: int = Field(default=1, ge=1, le=100)
    cpu_request: str | None = None
    memory_request: str | None = None
    cpu_limit: str | None = None
    memory_limit: str | None = None
    env_vars: dict[str, str] | None = None


class ApplicationScale(BaseModel):
    """Scale application replicas."""

    replicas: int = Field(ge=1, le=100)


class ApplicationRollback(BaseModel):
    """Rollback to a previous deployment."""

    deployment_id: uuid.UUID


# ---- Response Schemas ----


class DeploymentResponse(BaseModel):
    """Deployment history record."""

    id: uuid.UUID
    application_id: uuid.UUID
    image_tag: str
    strategy: str
    status: str
    triggered_by: str | None
    ai_risk_analysis: dict | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationResponse(BaseModel):
    """Application data response."""

    id: uuid.UUID
    project_id: uuid.UUID
    cluster_id: uuid.UUID
    name: str
    image: str
    namespace: str
    replicas: int
    cpu_request: str | None
    memory_request: str | None
    cpu_limit: str | None
    memory_limit: str | None
    status: str
    env_vars: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
