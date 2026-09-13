import React, { useState } from 'react';
import { Sliders, ArrowUpRight, ArrowDownRight, Check, AlertCircle, Sparkles } from 'lucide-react';
import { AutoscaleRecommendationResponse } from '../types';

interface PredictiveAutoscaleCardProps {
  autoscaleData?: AutoscaleRecommendationResponse | null;
  currentReplicas?: number;
  onApplyScale?: (targetReplicas: number) => void;
}

export const PredictiveAutoscaleCard: React.FC<PredictiveAutoscaleCardProps> = ({
  autoscaleData = {
    recommended_replicas: 5,
    action: 'scale_up',
    scaling_reason:
      'Predicted CPU demand (3.42 cores) exceeds target capacity for 3 replicas. Scaling up proactively to prevent SLA breach.',
    estimated_cost_change_percent: 66.7,
  },
  currentReplicas = 3,
  onApplyScale,
}) => {
  const [isApplied, setIsApplied] = useState(false);
  const target = autoscaleData?.recommended_replicas ?? 5;
  const isScaleUp = target > currentReplicas;

  const handleApply = () => {
    setIsApplied(true);
    if (onApplyScale) {
      onApplyScale(target);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Predictive Horizontal Pod Autoscaling</h3>
            <p className="text-xs text-slate-400 font-mono">Proactive SLA Preservation (Not Reactive HPA)</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
          Ahead-of-Time Trigger
        </span>
      </div>

      {/* Target Application & Replicas Comparison */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Replicas */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center">
          <span className="text-xs text-slate-400 block">Current Replicas</span>
          <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
            {isApplied ? target : currentReplicas}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">Capacity: {(currentReplicas * 0.7).toFixed(1)} cores</span>
        </div>

        {/* Action Indicator */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 mb-1">AI Recommendation</span>
          <div className={`flex items-center space-x-1.5 font-bold text-sm ${isScaleUp ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {isScaleUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="uppercase tracking-wider font-mono">
              {isApplied ? 'SCALED' : autoscaleData?.action.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            Cost Δ: +{autoscaleData?.estimated_cost_change_percent}%
          </span>
        </div>

        {/* Target Replicas */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/40 text-center ring-1 ring-cyan-500/20">
          <span className="text-xs text-cyan-300 font-medium block">Target Replicas</span>
          <span className="text-3xl font-extrabold text-cyan-400 font-mono mt-1 block">{target}</span>
          <span className="text-[11px] text-cyan-400/80 font-mono mt-1 block">Capacity: {(target * 0.7).toFixed(1)} cores</span>
        </div>
      </div>

      {/* Rationale Box */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-300 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{autoscaleData?.scaling_reason}</p>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          <span>Target App: </span>
          <code className="text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded">
            checkout-service (default)
          </code>
        </div>
        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`py-2 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition duration-150 flex items-center space-x-1.5 ${
            isApplied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
          }`}
        >
          {isApplied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Applied to Cluster</span>
            </>
          ) : (
            <span>Apply Proactive Scaling</span>
          )}
        </button>
      </div>
    </div>
  );
};
