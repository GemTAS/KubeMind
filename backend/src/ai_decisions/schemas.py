"""KubeMind Backend — AI Decisions Pydantic Schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class FeatureContribution(BaseModel):
    """Explainable AI (XAI) feature contribution (SHAP value representation)."""

    feature_name: str
    impact_score: float = Field(..., description="Positive increases risk/demand, negative decreases")
    description: str


class TelemetryFeatures(BaseModel):
    """Input telemetry features for XGBoost / LightGBM inference."""

    cpu_usage: float = Field(..., description="Current CPU usage in cores or percentage", ge=0.0)
    memory_usage_mb: float = Field(..., description="Current memory usage in MB", ge=0.0)
    request_rate: float = Field(default=0.0, description="Requests per second", ge=0.0)
    response_time_ms: float = Field(default=0.0, description="Average response latency in milliseconds", ge=0.0)
    error_rate: float = Field(default=0.0, description="Error rate (0.0 to 1.0)", ge=0.0, le=1.0)
    network_rx_mb: float = Field(default=0.0, description="Network received in MB/s", ge=0.0)
    network_tx_mb: float = Field(default=0.0, description="Network transmitted in MB/s", ge=0.0)
    pod_count: int = Field(default=1, description="Active replica or pod count", ge=1)
    hour_of_day: int = Field(default=12, ge=0, le=23)
    day_of_week: int = Field(default=2, ge=0, le=6)

    # Engineered lag features (standard for XGBoost / LightGBM time-series)
    lag_cpu_5m: float | None = None
    lag_cpu_15m: float | None = None
    lag_memory_5m: float | None = None
    lag_memory_15m: float | None = None


# ---- Workload Prediction ----


class WorkloadPredictionRequest(BaseModel):
    """Request payload for workload resource prediction."""

    cluster_id: uuid.UUID
    application_id: uuid.UUID | None = None
    horizon_minutes: int = Field(default=15, ge=1, le=120)
    features: TelemetryFeatures


class WorkloadPredictionResponse(BaseModel):
    """Predicted future workload output with confidence and XAI explanation."""

    predicted_cpu: float
    predicted_memory_mb: float
    trend: str = Field(..., description="spiking, increasing, stable, or decreasing")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    horizon_minutes: int
    model_name: str
    feature_importance: list[FeatureContribution]


# ---- Failure Prediction ----


class FailurePredictionRequest(BaseModel):
    """Request payload for node or application failure prediction."""

    cluster_id: uuid.UUID
    target_type: str = Field(default="node", description="node or pod")
    target_name: str
    features: TelemetryFeatures


class FailurePredictionResponse(BaseModel):
    """Predicted failure risk probability with root causes and remediation."""

    failure_probability: float = Field(..., ge=0.0, le=1.0)
    risk_level: str = Field(..., description="low, medium, high, or critical")
    predicted_failure_mode: str = Field(
        ..., description="OOMKilled, CPU_Throttling, PodEviction, DiskPressure, or Healthy"
    )
    top_risk_factors: list[FeatureContribution]
    recommended_remediation: str
    model_name: str


# ---- AI Scheduling Recommendation ----


class NodeCandidate(BaseModel):
    """Candidate node for AI scheduling evaluation."""

    node_name: str
    cpu_available: float
    memory_available_mb: float
    current_failure_risk: float = 0.0
    cost_per_hour: float = 0.0


class ScheduleRecommendationRequest(BaseModel):
    """Request to determine optimal node placement using AI scoring."""

    cluster_id: uuid.UUID
    pod_name: str
    cpu_request: float
    memory_request_mb: float
    nodes: list[NodeCandidate]


class ScheduleRecommendationResponse(BaseModel):
    """AI scheduling decision."""

    selected_node: str
    node_scores: dict[str, float]
    scoring_breakdown: dict[str, Any]
    reasoning: str


# ---- Predictive Autoscaling Recommendation ----


class AutoscaleRecommendationRequest(BaseModel):
    """Request for AI-driven proactive autoscaling."""

    cluster_id: uuid.UUID
    application_id: uuid.UUID
    current_replicas: int = Field(..., ge=1)
    predicted_cpu: float
    cpu_limit: float = Field(default=1.0, ge=0.1)
    target_utilization: float = Field(default=0.70, ge=0.1, le=1.0)


class AutoscaleRecommendationResponse(BaseModel):
    """Proactive autoscaling recommendation."""

    recommended_replicas: int
    action: str = Field(..., description="scale_up, scale_down, or maintain")
    scaling_reason: str
    estimated_cost_change_percent: float


# ---- AI Decision Logging & Feedback ----


class AIDecisionCreate(BaseModel):
    """Payload to log an AI decision for audit and RL feedback."""

    cluster_id: uuid.UUID
    application_id: uuid.UUID | None = None
    decision_type: str
    model_name: str
    model_version: str = "1.0.0"
    input_features: dict[str, Any]
    prediction_output: dict[str, Any]
    recommendation: dict[str, Any]
    explainability: dict[str, Any] | None = None
    action_taken: str | None = None


class AIDecisionOutcomeUpdate(BaseModel):
    """Update an AI decision with the observed outcome and reward score."""

    actual_outcome: dict[str, Any]
    reward_score: float | None = None


class AIDecisionResponse(BaseModel):
    """AI decision record."""

    id: uuid.UUID
    cluster_id: uuid.UUID
    application_id: uuid.UUID | None
    decision_type: str
    model_name: str
    model_version: str
    input_features: dict[str, Any]
    prediction_output: dict[str, Any]
    recommendation: dict[str, Any]
    explainability: dict[str, Any] | None
    action_taken: str | None
    actual_outcome: dict[str, Any] | None
    reward_score: float | None
    created_at: datetime
    evaluated_at: datetime | None

    model_config = {"from_attributes": True}


class ModelStatusResponse(BaseModel):
    """Status of available AI models in the inference engine."""

    model_name: str
    model_type: str  # XGBoost, LightGBM, Heuristic_Fallback
    model_file_present: bool
    status: str
    features_expected: list[str]
    description: str
