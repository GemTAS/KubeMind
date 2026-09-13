import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Wrench } from 'lucide-react';
import { FailurePredictionResponse } from '../types';

interface FailureRiskCardProps {
  failureData?: FailurePredictionResponse | null;
  onRemediate?: () => void;
}

export const FailureRiskCard: React.FC<FailureRiskCardProps> = ({ failureData, onRemediate }) => {
  const prob = failureData?.failure_probability ?? 0.78;
  const pct = Math.round(prob * 100);
  const isHighRisk = prob >= 0.5;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Failure & Anomaly Detection</h3>
              <p className="text-xs text-slate-400 font-mono">Model: {failureData?.model_name || 'LightGBM-Classifier-v1'}</p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              prob >= 0.75
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : prob >= 0.4
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {failureData?.risk_level || 'CRITICAL'} RISK
          </span>
        </div>

        {/* Risk Percentage & Gauge */}
        <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div>
            <span className="text-xs text-slate-400 block">Failure Probability</span>
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
              {pct}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Predicted Mode</span>
            <span className="text-sm font-bold text-amber-300 font-mono">
              {failureData?.predicted_failure_mode || 'OOMKilled'}
            </span>
          </div>
        </div>

        {/* Top Root Cause Factors */}
        <div className="mt-4 space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Top Risk Contributors (TreeSHAP XAI):
          </span>
          <div className="space-y-1.5 text-xs">
            {(failureData?.top_risk_factors || [
              { feature_name: 'memory_pressure', impact_score: 0.52, description: 'Memory usage approaching container ceiling (84%)' },
              { feature_name: 'error_rate', impact_score: 0.24, description: 'HTTP 5xx error rate elevated to 8.2%' },
            ]).map((factor) => (
              <div
                key={factor.feature_name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/40 text-slate-300"
              >
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{factor.description}</span>
                </div>
                <span className="font-mono text-rose-400 font-semibold shrink-0 ml-2">
                  +{(factor.impact_score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Autonomous Remediation Action Banner */}
      <div className="mt-6 pt-4 border-t border-slate-800/60">
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 border border-amber-500/30 mb-3">
          <div className="flex items-start space-x-2">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-snug">
              <strong className="text-amber-300 font-semibold">Recommended Remediation: </strong>
              {failureData?.recommended_remediation ||
                'Proactively increase memory limit or horizontally scale pod before kernel OOM-killer trigger.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRemediate}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition duration-150 active:scale-98 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
        >
          <span>Execute Auto-Remediation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
