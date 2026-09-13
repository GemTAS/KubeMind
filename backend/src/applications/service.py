"""KubeMind Backend — Application Service."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.applications.models import Application, Deployment
from src.applications.schemas import ApplicationCreate, ApplicationResponse, ApplicationScale, DeploymentResponse


class ApplicationService:
    """Application lifecycle management service."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: ApplicationCreate, triggered_by: str) -> ApplicationResponse:
        """Deploy a new application.

        Args:
            data: Application configuration.
            triggered_by: Username of the deployer.

        Returns:
            The created application response.
        """
        app = Application(
            name=data.name,
            project_id=data.project_id,
            cluster_id=data.cluster_id,
            image=data.image,
            namespace=data.namespace,
            replicas=data.replicas,
            cpu_request=data.cpu_request,
            memory_request=data.memory_request,
            cpu_limit=data.cpu_limit,
            memory_limit=data.memory_limit,
            env_vars=data.env_vars,
            status="deploying",
        )
        self.db.add(app)
        await self.db.flush()

        # Record deployment
        deployment = Deployment(
            application_id=app.id,
            image_tag=data.image,
            strategy="RollingUpdate",
            status="in_progress",
            triggered_by=triggered_by,
            started_at=datetime.now(UTC),
        )
        self.db.add(deployment)
        await self.db.flush()
        await self.db.refresh(app)

        # TODO: Actually deploy to Kubernetes via K8s API
        return ApplicationResponse.model_validate(app)

    async def get_all(self, project_id: uuid.UUID | None = None) -> list[ApplicationResponse]:
        """List applications, optionally filtered by project.

        Args:
            project_id: Optional project filter.

        Returns:
            List of application responses.
        """
        query = select(Application).order_by(Application.created_at.desc())
        if project_id:
            query = query.where(Application.project_id == project_id)
        result = await self.db.execute(query)
        apps = result.scalars().all()
        return [ApplicationResponse.model_validate(a) for a in apps]

    async def get_by_id(self, app_id: uuid.UUID) -> ApplicationResponse:
        """Get an application by ID.

        Args:
            app_id: The application UUID.

        Returns:
            The application response.
        """
        app = await self._get_app(app_id)
        return ApplicationResponse.model_validate(app)

    async def scale(self, app_id: uuid.UUID, data: ApplicationScale) -> ApplicationResponse:
        """Scale application replicas.

        Args:
            app_id: The application UUID.
            data: New replica count.

        Returns:
            Updated application response.
        """
        app = await self._get_app(app_id)
        app.replicas = data.replicas
        await self.db.flush()
        await self.db.refresh(app)

        # TODO: Scale in Kubernetes via K8s API
        return ApplicationResponse.model_validate(app)

    async def restart(self, app_id: uuid.UUID) -> ApplicationResponse:
        """Restart all pods of an application.

        Args:
            app_id: The application UUID.

        Returns:
            The application response.
        """
        app = await self._get_app(app_id)

        # TODO: Perform rolling restart via K8s API
        return ApplicationResponse.model_validate(app)

    async def delete(self, app_id: uuid.UUID) -> None:
        """Delete an application.

        Args:
            app_id: The application UUID.
        """
        app = await self._get_app(app_id)

        # TODO: Delete from Kubernetes via K8s API
        await self.db.delete(app)

    async def get_deployments(self, app_id: uuid.UUID) -> list[DeploymentResponse]:
        """Get deployment history for an application.

        Args:
            app_id: The application UUID.

        Returns:
            List of deployment records.
        """
        await self._get_app(app_id)  # Verify app exists
        result = await self.db.execute(
            select(Deployment)
            .where(Deployment.application_id == app_id)
            .order_by(Deployment.created_at.desc())
        )
        deployments = result.scalars().all()
        return [DeploymentResponse.model_validate(d) for d in deployments]

    async def _get_app(self, app_id: uuid.UUID) -> Application:
        """Get application by ID or raise 404."""
        result = await self.db.execute(select(Application).where(Application.id == app_id))
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {app_id} not found.",
            )
        return app
