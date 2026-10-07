"""KubeMind Backend — Core Configuration.

All settings are loaded from environment variables via Pydantic Settings.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Application ----
    app_name: str = "KubeMind"
    app_version: str = "0.1.0"
    backend_debug: bool = False
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_log_level: str = "info"

    # ---- Database (Supabase Managed PostgreSQL or Local PostgreSQL) ----
    database_url_env: str | None = Field(default=None, alias="database_url")

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "kubemind"
    postgres_user: str = "kubemind"
    postgres_password: str = "changeme"

    # ---- Redis (Optional - Phase 2) ----
    redis_enabled: bool = False
    redis_host: str = "localhost"
    redis_port: int = 6379

    # ---- Supabase Auth ----
    supabase_url: str = Field(default="", alias="supabase_url")
    supabase_anon_key: str = Field(default="", alias="supabase_anon_key")
    supabase_jwt_secret: str | None = Field(default=None, alias="supabase_jwt_secret")
    supabase_jwt_algorithm: str = "HS256"

    # ---- CORS ----
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @property
    def database_url(self) -> str:
        """Async PostgreSQL connection URL (supports Supabase or local Postgres)."""
        if self.database_url_env:
            url = self.database_url_env
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def database_url_sync(self) -> str:
        """Sync PostgreSQL connection URL (for Alembic migrations)."""
        if self.database_url_env:
            url = self.database_url_env
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        """Redis connection URL."""
        return f"redis://{self.redis_host}:{self.redis_port}/0"


@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
