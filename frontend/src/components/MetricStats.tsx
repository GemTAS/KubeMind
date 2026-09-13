import React from 'react';
import { Server, Box, HeartPulse, Percent, DollarSign, ArrowUpRight } from 'lucide-react';
import { ClusterNode } from '../types';

interface MetricStatsProps {
  nodes: ClusterNode[];
  healthScore?: number;
}

export const MetricStats: React.FC<MetricStatsProps> = ({ nodes, healthScore = 88 }) => {
  const totalCpuCap = nodes.reduce((sum, n) => sum + n.cpuCapacity, 0);
  const totalCpuUsed = nodes.reduce((sum, n) => sum + n.cpuUsage, 0);
  const totalMemCap = nodes.reduce((sum, n) => sum + n.memoryCapacityMb, 0);
  const totalMemUsed = nodes.reduce((sum, n) => sum + n.memoryUsageMb, 0);
  const totalPods = nodes.reduce((sum, n) => sum + n.podCount, 0);

  const cpuPct = Math.round((totalCpuUsed / totalCpuCap) * 100) || 0;
  const memPct = Math.round((totalMemUsed / totalMemCap) * 100) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cluster Nodes & Capacity */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition shadow-lg shadow-black/20 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Cluster Nodes</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center ring-1 ring-cyan-500/20">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">{nodes.length}</span>
          <span className="text-xs text-emerald-400 font-medium">100% Ready</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>CPU Allocated</span>
          <span className="font-mono text-slate-300">{cpuPct}% ({totalCpuUsed.toFixed(1)} / {totalCpuCap} cores)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              cpuPct > 80 ? 'bg-rose-500' : cpuPct > 60 ? 'bg-amber-400' : 'bg-cyan-500'
            }`}
            style={{ width: `${cpuPct}%` }}
          />
        </div>
      </div>

      {/* Running Workload Pods */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition shadow-lg shadow-black/20 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Workloads</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/20">
            <Box className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">{totalPods}</span>
          <span className="text-xs text-slate-400">Pods</span>
          <span className="text-xs text-amber-400 font-medium ml-auto">1 Pending AI Sched</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>RAM Utilization</span>
          <span className="font-mono text-slate-300">{memPct}% ({(totalMemUsed / 1024).toFixed(1)} / {(totalMemCap / 1024).toFixed(1)} GB)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              memPct > 80 ? 'bg-rose-500' : memPct > 60 ? 'bg-indigo-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${memPct}%` }}
          />
        </div>
      </div>

      {/* Cluster Health Score */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition shadow-lg shadow-black/20 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Cluster Health Score</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">{healthScore}%</span>
          <span className="text-xs text-emerald-400 font-medium">Optimal Stability</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Failure Risk</span>
          <span className="font-mono text-amber-400 font-medium">Worker-1 Elevated (68%)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* Cost & Wastage Optimization */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition shadow-lg shadow-black/20 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Cost Optimization</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center ring-1 ring-purple-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-white">24.8%</span>
          <span className="text-xs text-purple-400 font-medium flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            Wastage Cut
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>AI Autoscaling</span>
          <span className="font-mono text-purple-300">Active (Right-sizing)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-3/4" />
        </div>
      </div>
    </div>
  );
};
