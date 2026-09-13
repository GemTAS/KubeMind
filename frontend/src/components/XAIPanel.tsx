import React from 'react';
import { BrainCircuit, Info, Sparkles, CheckCircle } from 'lucide-react';
import { FeatureContribution } from '../types';

interface XAIPanelProps {
  features?: FeatureContribution[];
  modelName?: string;
}

export const XAIPanel: React.FC<XAIPanelProps> = ({
  features = [
    { feature_name: 'request_rate', impact_score: 0.42, description: 'Surge in inbound HTTP requests per second (240 req/s)' },
    { feature_name: 'lag_cpu_5m', impact_score: 0.28, description: 'Positive velocity in recent 5-minute rolling window' },
    { feature_name: 'diurnal_cycle', impact_score: 0.16, description: 'Historical cyclic business traffic peak at 12:30 PM' },
    { feature_name: 'memory_growth_rate', impact_score: 0.09, description: 'Active heap allocation rate (+35 MB/min)' },
  ],
  modelName = 'XGBoost + TreeSHAP Engine',
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Explainable AI (XAI) Decision Attribution</h3>
            <p className="text-xs text-slate-400 font-mono">Mathematical Feature Attributions ({modelName})</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
          TreeSHAP Validated
        </span>
      </div>

      <p className="text-xs text-slate-300 my-4 leading-relaxed">
        KubeMind never acts as a black box. Each scaling, scheduling, and remediation decision is backed by
        exact Shapley values calculated against current and historical cluster telemetry:
      </p>

      {/* SHAP Feature Contribution Bars */}
      <div className="space-y-3.5">
        {features.map((feat) => {
          const pct = Math.min(100, Math.round(feat.impact_score * 100));
          return (
            <div key={feat.feature_name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-cyan-300 font-semibold">{feat.feature_name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 truncate max-w-sm">{feat.description}</span>
                </div>
                <span className="font-mono font-bold text-purple-400">+{pct}% impact</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Academic Citation Note */}
      <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Calculated via TreeSHAP Shapley Additive Explanations for multi-variate telemetry</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px] shrink-0 ml-3">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Audit Verified</span>
        </div>
      </div>
    </div>
  );
};
