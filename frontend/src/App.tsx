import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricStats } from './components/MetricStats';
import { WorkloadForecastChart } from './components/WorkloadForecastChart';
import { FailureRiskCard } from './components/FailureRiskCard';
import { XAIPanel } from './components/XAIPanel';
import { IntelligentSchedulerCard } from './components/IntelligentSchedulerCard';
import { PredictiveAutoscaleCard } from './components/PredictiveAutoscaleCard';
import { ClusterTopology } from './components/ClusterTopology';
import { DecisionAuditTable } from './components/DecisionAuditTable';
import {
  apiService,
  MOCK_NODES,
  MOCK_TIME_SERIES,
} from './services/api';
import {
  AIDecision,
  AutoscaleRecommendationResponse,
  ClusterNode,
  FailurePredictionResponse,
  ScheduleRecommendationResponse,
  WorkloadPredictionResponse,
  WorkloadTimeSeriesPoint,
} from './types';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(15);

  const [nodes, setNodes] = useState<ClusterNode[]>(MOCK_NODES);
  const [timeSeries, setTimeSeries] = useState<WorkloadTimeSeriesPoint[]>(MOCK_TIME_SERIES);
  const [workloadPred, setWorkloadPred] = useState<WorkloadPredictionResponse | null>(null);
  const [failurePred, setFailurePred] = useState<FailurePredictionResponse | null>(null);
  const [scheduleRec, setScheduleRec] = useState<ScheduleRecommendationResponse | null>(null);
  const [autoscaleRec, setAutoscaleRec] = useState<AutoscaleRecommendationResponse | null>(null);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const connected = await apiService.checkHealth();
    setIsBackendConnected(connected);

    try {
      // Telemetry features for Worker-1 (which has high load)
      const features = {
        cpu_usage: 2.85,
        memory_usage_mb: 3450,
        request_rate: 240,
        response_time_ms: 620,
        error_rate: 0.08,
        network_rx_mb: 18.5,
        network_tx_mb: 22.1,
        pod_count: 14,
        hour_of_day: 12,
        day_of_week: 2,
        lag_cpu_5m: 2.7,
        lag_cpu_15m: 2.35,
        lag_memory_5m: 3340,
      };

      const [wp, fp, sr, ar, decs] = await Promise.all([
        apiService.predictWorkload(features, selectedHorizon),
        apiService.predictFailure(features),
        apiService.recommendSchedule('order-service-7f4c8', 0.5, 512),
        apiService.recommendAutoscale(3, 3.42),
        apiService.getDecisions(),
      ]);

      setWorkloadPred(wp);
      setFailurePred(fp);
      setScheduleRec(sr);
      setAutoscaleRec(ar);
      setDecisions(decs);
    } catch (err) {
      console.warn('Using simulated telemetry fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedHorizon]);

  const showNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleRemediate = () => {
    showNotification('Autonomous Action: Scaled out payment-service replicas & initiated node drain on kind-worker-1.');
    // Update node risk locally
    setNodes((prev) =>
      prev.map((n) => (n.name === 'kind-worker-1' ? { ...n, failureRisk: 0.22, memoryUsageMb: 2400 } : n))
    );
  };

  const handleSchedulePod = () => {
    showNotification("Autonomous Action: Pod 'order-service-7f4c8' successfully scheduled onto 'kind-worker-2'.");
  };

  const handleApplyScale = (replicas: number) => {
    showNotification(`Autonomous Action: Horizontally scaled 'checkout-service' to ${replicas} replicas.`);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Header
        isBackendConnected={isBackendConnected}
        onRefresh={loadDashboardData}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Toast */}
          {actionNotification && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 border border-emerald-500/40 backdrop-blur-md shadow-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium">{actionNotification}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                Action Executed
              </span>
            </div>
          )}

          {/* Overview Tab (All-in-one Master Cockpit) */}
          {activeTab === 'overview' && (
            <>
              {/* Top KPI Cards */}
              <MetricStats nodes={nodes} />

              {/* Row 1: Forecast Chart (2/3) + Failure Detection (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <WorkloadForecastChart
                    data={timeSeries}
                    prediction={workloadPred}
                    onHorizonChange={setSelectedHorizon}
                    selectedHorizon={selectedHorizon}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FailureRiskCard failureData={failurePred} onRemediate={handleRemediate} />
                </div>
              </div>

              {/* Row 2: Scheduler + Predictive Autoscaling */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IntelligentSchedulerCard
                  nodes={nodes}
                  recommendation={scheduleRec}
                  onSchedulePod={handleSchedulePod}
                />
                <PredictiveAutoscaleCard
                  autoscaleData={autoscaleRec}
                  currentReplicas={3}
                  onApplyScale={handleApplyScale}
                />
              </div>

              {/* Row 3: Explainable AI & Audit Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <XAIPanel features={workloadPred?.feature_importance} />
                <DecisionAuditTable decisions={decisions} />
              </div>
            </>
          )}

          {/* Workload Tab */}
          {activeTab === 'workload' && (
            <div className="space-y-6">
              <WorkloadForecastChart
                data={timeSeries}
                prediction={workloadPred}
                onHorizonChange={setSelectedHorizon}
                selectedHorizon={selectedHorizon}
              />
              <XAIPanel features={workloadPred?.feature_importance} />
            </div>
          )}

          {/* Failure Tab */}
          {activeTab === 'failure' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FailureRiskCard failureData={failurePred} onRemediate={handleRemediate} />
              <XAIPanel features={failurePred?.top_risk_factors} modelName="LightGBM + TreeSHAP" />
            </div>
          )}

          {/* Scheduler Tab */}
          {activeTab === 'scheduler' && (
            <IntelligentSchedulerCard
              nodes={nodes}
              recommendation={scheduleRec}
              onSchedulePod={handleSchedulePod}
            />
          )}

          {/* Autoscaling Tab */}
          {activeTab === 'autoscale' && (
            <PredictiveAutoscaleCard
              autoscaleData={autoscaleRec}
              currentReplicas={3}
              onApplyScale={handleApplyScale}
            />
          )}

          {/* Explainable AI Tab */}
          {activeTab === 'xai' && (
            <XAIPanel features={workloadPred?.feature_importance} />
          )}

          {/* Topology Tab */}
          {activeTab === 'topology' && (
            <ClusterTopology nodes={nodes} />
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <DecisionAuditTable decisions={decisions} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
