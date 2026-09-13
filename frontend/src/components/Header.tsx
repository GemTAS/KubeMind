import React from 'react';
import { Cpu, Activity, Server, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isBackendConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isBackendConnected, onRefresh, isLoading }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Cpu className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              KubeMind
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              AI Ops v0.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Autonomous Cloud Operations Platform</p>
        </div>
      </div>

      {/* Live Status Indicators */}
      <div className="flex items-center space-x-4">
        {/* Cluster Selector */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Cluster:</span>
          <span className="font-semibold text-slate-200">kind-kubemind-dev</span>
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">AI Stack:</span>
          <span className="font-semibold text-cyan-300">XGBoost + LightGBM</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        {/* Backend Connectivity Status */}
        <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Activity className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-400">API:</span>
          <span className={`font-semibold ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isBackendConnected ? 'Connected (8000)' : 'Simulated (Offline)'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition duration-150 active:scale-95 disabled:opacity-50"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
