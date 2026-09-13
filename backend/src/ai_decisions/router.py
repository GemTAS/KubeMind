"""KubeMind Backend — AI Decisions & Prediction API Router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai_decisions.schemas import (
    AIDecisionCreate,
    AIDecisionOutcomeUpdate,
    AIDecisionResponse,
    AutoscaleRecommendationRequest,
    AutoscaleRecommendationResponse,
    FailurePredictionRequest,
    FailurePredictionResponse,
    ModelStatusResponse,
    ScheduleRecommendationRequest,
    ScheduleRecommendationResponse,
    WorkloadPredictionRequest,
    WorkloadPredictionResponse,
)
from src.ai_decisions.service import AIDecisionService
from src.core.database import get_db
from src.core.dependencies import CurrentUser

router = APIRouter(prefix="/ai", tags=["AI Operations & Predictions"])


def get_ai_service(db: AsyncSession = Depends(get_db)) -> AIDecisionService:
    """Dependency to create AIDecisionService instance."""
    return AIDecisionService(db)


@router.get("/models", response_model=list[ModelStatusResponse])
async def list_models(
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> list[ModelStatusResponse]:
    """Check status of deployed XGBoost / LightGBM models in the inference engine."""
    return service.get_models_status()


@router.post("/predict/workload", response_model=WorkloadPredictionResponse)
async def predict_workload(
    request: WorkloadPredictionRequest,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> WorkloadPredictionResponse:
    """Predict CPU & Memory workload demand for the next N minutes with XAI explanations."""
    return service.predict_workload(request)


@router.post("/predict/failure", response_model=FailurePredictionResponse)
async def predict_failure(
    request: FailurePredictionRequest,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> FailurePredictionResponse:
    """Predict node/pod crash risk, failure mode (OOMKilled/Throttling), and root causes."""
    return service.predict_failure(request)


@router.post("/recommend/schedule", response_model=ScheduleRecommendationResponse)
async def recommend_schedule(
    request: ScheduleRecommendationRequest,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> ScheduleRecommendationResponse:
    """Calculate AI-scored node selection for pending pod placement."""
    return service.recommend_schedule(request)


@router.post("/recommend/autoscale", response_model=AutoscaleRecommendationResponse)
async def recommend_autoscale(
    request: AutoscaleRecommendationRequest,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> AutoscaleRecommendationResponse:
    """Get proactive autoscaling recommendation based on predicted workload demand."""
    return service.recommend_autoscale(request)


@router.post("/decisions", response_model=AIDecisionResponse, status_code=status.HTTP_201_CREATED)
async def log_decision(
    data: AIDecisionCreate,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> AIDecisionResponse:
    """Log an AI decision for Explainable AI (XAI) audit trail and feedback training."""
    decision = await service.log_decision(data)
    return AIDecisionResponse.model_validate(decision)


@router.get("/decisions", response_model=list[AIDecisionResponse])
async def list_decisions(
    _current_user: CurrentUser,
    cluster_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    service: AIDecisionService = Depends(get_ai_service),
) -> list[AIDecisionResponse]:
    """Retrieve historical AI decisions, predictions, and recommendations."""
    decisions = await service.get_decisions(cluster_id=cluster_id, limit=limit)
    return [AIDecisionResponse.model_validate(d) for d in decisions]


@router.patch("/decisions/{decision_id}/outcome", response_model=AIDecisionResponse)
async def record_outcome(
    decision_id: uuid.UUID,
    data: AIDecisionOutcomeUpdate,
    _current_user: CurrentUser,
    service: AIDecisionService = Depends(get_ai_service),
) -> AIDecisionResponse:
    """Record observed outcome and reward score for the continuous learning feedback loop."""
    decision = await service.record_outcome(decision_id, data)
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"AI decision with ID {decision_id} not found",
        )
    return AIDecisionResponse.model_validate(decision)
