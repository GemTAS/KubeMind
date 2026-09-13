import React from 'react';
import { GitBranch, Check, X, ShieldAlert, Zap, Cpu } from 'lucide-react';
import { ClusterNode, ScheduleRecommendationResponse } from '../types';

interface IntelligentSchedulerCardProps {
  nodes: ClusterNode[];
  recommendation?: ScheduleRecommendationResponse | null;
  onSchedulePod?: () => void;
}

export const IntelligentSchedulerCard: React.FC<IntelligentSchedulerCardProps> = ({
  nodes,
  recommendation = {
    selected_node: 'kind-worker-2',
    node_scores: {
      'kind-control-plane': -1.0,
      'kind-worker-1': 8.4,
      'kind-worker-2': 42.6,
    },
    scoring_breakdown: {
      'kind-worker-1': { feasible: true, capacity_score: 18.2, risk_penalty: 27.2, cost_penalty: 0.24 },
      'kind-worker-2': { feasible: true, capacity_score: 48.5, risk_penalty: 3.6, cost_penalty: 0.24 },
    },
    reasoning:
      "Selected 'kind-worker-2' with score 42.60. Has minimal failure risk (3.60 penalty) compared to 'kind-worker-1' (27.20 penalty due to memory pressure).",
  },
  onSchedulePod,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">AI-Assisted Intelligent Scheduler</h3>
            <p className="text-xs text-slate-400 font-mono">Dynamic Multi-Objective Node Scoring</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
          Selected: {recommendation?.selected_node || 'kind-worker-2'}
        </span>
      </div>

      {/* Pod Request Context */}
      <div className="my-4 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Incoming Pod:</span>
          <code className="text-cyan-300 font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded">
            order-service-7f4c8
          </code>
        </div>
        <div className="flex items-center space-x-4 text-slate-300 font-mono">
          <span>Req CPU: <strong>0.50 cores</strong></span>
          <span>Req RAM: <strong>512 MB</strong></span>
          <span>Priority: <strong>High (Tier-1)</strong></span>
        </div>
      </div>

      {/* Candidate Nodes Comparison Table */}
      <div className="space-y-3">
        {nodes.map((node) => {
          const isSelected = node.name === recommendation?.selected_node;
          const isControl = node.role === 'control-plane';
          const score = recommendation?.node_scores[node.name] ?? (isControl ? -1.0 : isSelected ? 42.6 : 8.4);
          const breakdown = recommendation?.scoring_breakdown[node.name];

          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : isControl
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : isControl ? <X className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-white">{node.name}</h4>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          Recommended Node
                        </span>
                      )}
                      {isControl && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                          Tainted (Control-Plane)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Avail CPU: {(node.cpuCapacity - node.cpuUsage).toFixed(2)} cores • Avail RAM:{' '}
                      {node.memoryCapacityMb - node.memoryUsageMb} MB • Failure Risk: {(node.failureRisk * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">AI Score</span>
                  <span
                    className={`font-mono text-base font-bold ${
                      isSelected
                        ? 'text-cyan-400'
                        : isControl
                        ? 'text-slate-500'
                        : 'text-amber-400'
                    }`}
                  >
                    {score < 0 ? 'N/A' : score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Penalty Breakdown */}
              {!isControl && breakdown && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Capacity Bonus: <strong className="text-emerald-400">+{breakdown.capacity_score ?? 35}</strong></span>
                  <span>Risk Penalty: <strong className="text-rose-400">-{breakdown.risk_penalty ?? 0}</strong></span>
                  <span>Cost Factor: <strong className="text-purple-400">-{breakdown.cost_penalty ?? 0.24}</strong></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reasoning Footer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{recommendation?.reasoning}</span>
        </div>
        <button
          onClick={onSchedulePod}
          className="ml-4 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 transition"
        >
          Bind Pod
        </button>
      </div>
    </div>
  );
};
