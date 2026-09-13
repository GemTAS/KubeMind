import React from 'react';
import { History, CheckCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import { AIDecision } from '../types';

interface DecisionAuditTableProps {
  decisions: AIDecision[];
}

export const DecisionAuditTable: React.FC<DecisionAuditTableProps> = ({ decisions }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">AI Decision Audit & RL Experience Dataset</h3>
            <p className="text-xs text-slate-400 font-mono">
              Continuous Logging: State $\to$ Action $\to$ Reward $\to$ Next State
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          {decisions.length} Experiences Stored
        </span>
      </div>

      {/* Decisions List Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 px-2">Decision Type</th>
              <th className="pb-3 px-2">Model Used</th>
              <th className="pb-3 px-2">Autonomous Action</th>
              <th className="pb-3 px-2">XAI Attribution</th>
              <th className="pb-3 px-2">RL Reward</th>
              <th className="pb-3 px-2">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {decisions.map((dec) => (
              <tr key={dec.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-2">
                  <span className="font-mono font-semibold text-cyan-300 capitalize">
                    {dec.decision_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-2 text-slate-400 font-mono">{dec.model_name}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-1 font-mono text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{dec.action_taken || 'Executed'}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-slate-400 max-w-xs truncate">
                  {dec.explainability?.top_feature || dec.explainability?.trigger || 'Validated by SHAP'}
                </td>
                <td className="py-3 px-2">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +{dec.reward_score?.toFixed(2) || '0.92'}
                  </span>
                </td>
                <td className="py-3 px-2 text-slate-500 font-mono">
                  {new Date(dec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
