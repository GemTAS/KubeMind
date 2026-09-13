// KubeMind Frontend TypeScript Definitions

export interface FeatureContribution {
  feature_name: string;
  impact_score: number;
  description: string;
}

export interface TelemetryFeatures {
  cpu_usage: number;
  memory_usage_mb: number;
  request_rate: number;
  response_time_ms: number;
  error_rate: number;
  network_rx_mb: number;
  network_tx_mb: number;
  pod_count: number;
  hour_of_day: number;
  day_of_week: number;
  lag_cpu_5m?: number;
  lag_cpu_15m?: number;
  lag_memory_5m?: number;
  lag_memory_15m?: number;
}

export interface WorkloadPredictionResponse {
  predicted_cpu: number;
  predicted_memory_mb: number;
  trend: 'spiking' | 'increasing' | 'stable' | 'decreasing';
  confidence_score: number;
  horizon_minutes: number;
  model_name: string;
  feature_importance: FeatureContribution[];
}

export interface FailurePredictionResponse {
  failure_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_failure_mode: 'OOMKilled' | 'CPU_Throttling' | 'PodEviction' | 'NetworkTimeout' | 'Healthy';
  top_risk_factors: FeatureContribution[];
  recommended_remediation: string;
  model_name: string;
}

export interface NodeCandidate {
  node_name: string;
  cpu_available: number;
  memory_available_mb: number;
  current_failure_risk: number;
  cost_per_hour: number;
}

export interface ScheduleRecommendationResponse {
  selected_node: string;
  node_scores: Record<string, number>;
  scoring_breakdown: Record<string, {
    feasible: boolean;
    capacity_score?: number;
    risk_penalty?: number;
    cost_penalty?: number;
    reason?: string;
  }>;
  reasoning: string;
}

export interface AutoscaleRecommendationResponse {
  recommended_replicas: number;
  action: 'scale_up' | 'scale_down' | 'maintain';
  scaling_reason: string;
  estimated_cost_change_percent: number;
}

export interface ModelStatus {
  model_name: string;
  model_type: string;
  model_file_present: boolean;
  status: string;
  features_expected: string[];
  description: string;
}

export interface AIDecision {
  id: string;
  cluster_id: string;
  application_id?: string;
  decision_type: string;
  model_name: string;
  model_version: string;
  input_features: Record<string, any>;
  prediction_output: Record<string, any>;
  recommendation: Record<string, any>;
  explainability?: Record<string, any>;
  action_taken?: string;
  actual_outcome?: Record<string, any>;
  reward_score?: number;
  created_at: string;
  evaluated_at?: string;
}

export interface ClusterNode {
  id: string;
  name: string;
  role: 'control-plane' | 'worker';
  status: 'Ready' | 'NotReady' | 'Degraded';
  cpuCapacity: number;
  cpuUsage: number;
  memoryCapacityMb: number;
  memoryUsageMb: number;
  podCount: number;
  failureRisk: number;
  zone: string;
}

export interface WorkloadTimeSeriesPoint {
  time: string;
  actualCpu: number;
  predictedCpu: number;
  upperBound?: number;
  lowerBound?: number;
  actualMemory: number;
  predictedMemory: number;
}
