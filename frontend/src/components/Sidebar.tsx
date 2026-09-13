import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  GitBranch,
  Sliders,
  HelpCircle,
  Network,
  History,
  BrainCircuit,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'workload', label: 'Workload Forecast', icon: TrendingUp, badge: 'XGBoost' },
    { id: 'failure', label: 'Failure Prediction', icon: AlertTriangle, badge: 'LightGBM' },
    { id: 'scheduler', label: 'AI Scheduler', icon: GitBranch, badge: 'Optimal' },
    { id: 'autoscale', label: 'Predictive Autoscaling', icon: Sliders, badge: 'Auto' },
    { id: 'xai', label: 'Explainable AI (XAI)', icon: BrainCircuit, badge: 'SHAP' },
    { id: 'topology', label: 'Cluster Topology', icon: Network },
    { id: 'audit', label: 'Decision Audit & RL', icon: History, badge: 'Log' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400/80 mb-2">
            Operations & AI
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Feedback Engine</span>
          <span className="text-[10px] text-emerald-400 font-mono">Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Logging <code className="text-cyan-400 font-mono">(S, A, R, S')</code> experiences for long-term RL retraining.
        </p>
      </div>
    </aside>
  );
};
