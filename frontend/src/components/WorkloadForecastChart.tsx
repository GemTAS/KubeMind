import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, Zap, Info } from 'lucide-react';
import { WorkloadTimeSeriesPoint, WorkloadPredictionResponse } from '../types';

interface WorkloadForecastChartProps {
  data: WorkloadTimeSeriesPoint[];
  prediction?: WorkloadPredictionResponse | null;
  onHorizonChange: (minutes: number) => void;
  selectedHorizon: number;
}

export const WorkloadForecastChart: React.FC<WorkloadForecastChartProps> = ({
  data,
  prediction,
  onHorizonChange,
  selectedHorizon,
}) => {
  const [metricMode, setMetricMode] = useState<'cpu' | 'memory'>('cpu');

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl shadow-black/30">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Workload Resource Demand Forecast
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              XGBoost Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical Prometheus metrics vs. multi-variate predicted demand trajectory.
          </p>
        </div>

        {/* Metric Switch & Horizon Buttons */}
        <div className="flex items-center space-x-3">
          {/* Metric Selector */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setMetricMode('cpu')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                metricMode === 'cpu'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CPU (Cores)
            </button>
            <button
              onClick={() => setMetricMode('memory')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                metricMode === 'memory'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Memory (MB)
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => onHorizonChange(mins)}
                className={`px-2 py-1 rounded-lg font-mono text-xs transition ${
                  selectedHorizon === mins
                    ? 'bg-slate-700 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                +{mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBounds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              domain={metricMode === 'cpu' ? [0, 4.5] : [1000, 4500]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {/* Confidence Upper Bound */}
            {metricMode === 'cpu' && (
              <Area
                type="monotone"
                dataKey="upperBound"
                name="Confidence Range"
                stroke="transparent"
                fill="url(#colorBounds)"
              />
            )}

            {/* Actual Metric Line */}
            <Area
              type="monotone"
              dataKey={metricMode === 'cpu' ? 'actualCpu' : 'actualMemory'}
              name={metricMode === 'cpu' ? 'Observed CPU' : 'Observed Memory'}
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#colorActual)"
            />

            {/* Predicted Metric Line */}
            <Area
              type="monotone"
              dataKey={metricMode === 'cpu' ? 'predictedCpu' : 'predictedMemory'}
              name={metricMode === 'cpu' ? 'XGBoost Predicted CPU' : 'Predicted Memory'}
              stroke="#06b6d4"
              strokeDasharray="4 4"
              strokeWidth={2.5}
              fill="url(#colorPred)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Model Insight Bar */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>
            Forecast Verdict: <strong className="text-white font-semibold">{prediction?.trend.toUpperCase() || 'SPIKING'}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Predicted Demand: <strong className="text-cyan-300 font-mono">{prediction?.predicted_cpu || 3.42} cores</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Model Confidence: <strong className="text-emerald-400 font-mono">{((prediction?.confidence_score || 0.94) * 100).toFixed(0)}%</strong>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Proactive trigger calculated 15m ahead of threshold breach</span>
        </div>
      </div>
    </div>
  );
};
