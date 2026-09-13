"""KubeMind Backend — AI Decisions SQLAlchemy Models."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class AIDecision(Base):
    """Log of every AI prediction, recommendation, action, and outcome.

    Forms the basis of the Explainable AI (XAI) audit trail and provides the
    experience replay dataset (State, Action, Reward, Next State) for Reinforcement
    Learning retraining.
    """

    __tablename__ = "ai_decisions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    application_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)

    decision_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # workload_prediction, failure_prediction, scheduling, autoscaling, remediation
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)  # xgboost_workload, lightgbm_failure
    model_version: Mapped[str] = mapped_column(String(50), default="1.0.0")

    # Inputs fed into the model
    input_features: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Output predictions and confidence
    prediction_output: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Concrete operational recommendation
    recommendation: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Explainable AI (XAI) feature importance (e.g. SHAP values)
    explainability: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Actual action executed in Kubernetes
    action_taken: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Actual outcome observed later (used for feedback loop and RL reward calculation)
    actual_outcome: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    reward_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    evaluated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<AIDecision {self.decision_type} model={self.model_name} id={self.id}>"
