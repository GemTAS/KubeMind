import React from 'react';
import { Network, Server, Cpu, Box, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ClusterNode } from '../types';

interface ClusterTopologyProps {
  nodes: ClusterNode[];
}

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({ nodes }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Interactive Cluster & Microservice Topology</h3>
            <p className="text-xs text-slate-400 font-mono">Control Plane $\leftrightarrow$ Worker Nodes $\leftrightarrow$ Service Mesh</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          OpenTelemetry Monitored
        </span>
      </div>

      {/* Visual Topological Diagram */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Node 1: Control Plane */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative shadow-lg group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">kind-control-plane</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Master
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-2">IP: 172.18.0.2 • Zone: local-1a</p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>kube-apiserver</span>
              <span className="text-emerald-400 text-[10px]">Healthy</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>etcd (consensus)</span>
              <span className="text-emerald-400 text-[10px]">Healthy</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>kubemind-scheduler</span>
              <span className="text-cyan-400 font-mono text-[10px] font-semibold">Active AI</span>
            </div>
          </div>
        </div>

        {/* Node 2: Worker 1 (Elevated Risk) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/20 to-slate-900 border border-rose-500/40 relative shadow-lg ring-1 ring-rose-500/20 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white">kind-worker-1</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
              Risk 68%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-2">RAM: 3.45 / 4.0 GB (86% Pressure)</p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-200">payment-service-x1</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">High Mem</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200">checkout-service-a</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">P95 620ms</span>
            </div>
          </div>
        </div>

        {/* Node 3: Worker 2 (Healthy & Candidate) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-slate-900 border border-cyan-500/40 relative shadow-lg ring-1 ring-cyan-500/20 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">kind-worker-2</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 mr-1 text-cyan-400" />
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-2">RAM: 1.82 / 4.0 GB (45% Healthy)</p>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200">auth-service-v2</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Nominal</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200">inventory-catalog</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
