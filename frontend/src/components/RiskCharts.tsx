import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { SiteRiskScoreResponse } from '../types';
import { BarChart3, PieChart as PieIcon, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RiskChartsProps {
  scoreData: SiteRiskScoreResponse | null;
}

export const RiskCharts: React.FC<RiskChartsProps> = ({ scoreData }) => {
  const { isDark } = useTheme();

  if (!scoreData) {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse text-slate-400 text-center text-sm">
        Loading Risk Distribution Charts...
      </div>
    );
  }

  // Format data for Hazard Type Bar Chart
  const typeData = Object.entries(scoreData.distribution_by_type).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }));

  // Format data for Severity Donut Chart
  const SEVERITY_COLORS: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444',
  };

  const severityData = Object.entries(scoreData.distribution_by_severity)
    .filter(([_, count]) => count > 0)
    .map(([sev, count]) => ({
      name: sev.charAt(0).toUpperCase() + sev.slice(1),
      value: count,
      color: SEVERITY_COLORS[sev.toLowerCase()] || '#64748B',
    }));

  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }
    : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' };

  const barColor = isDark ? '#38bdf8' : '#0284c7';
  const axisColor = isDark ? '#94a3b8' : '#475569';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Hazards by Type (Bar Chart) */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-4 h-4 text-cyan-500" />
          <h4 className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white">Hazards Detected by Type</h4>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="type" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
              <Bar dataKey="count" fill={barColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Risk Distribution by Severity (Donut Chart) */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center space-x-2 mb-4">
          <PieIcon className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white">Severity Breakdown</h4>
        </div>
        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: axisColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top Hazardous Zones */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white">High-Risk Site Zones</h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">{scoreData.top_hazardous_zones.length} Zones</span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
          {scoreData.top_hazardous_zones.map((z, idx) => {
            const getSevBadge = (sev: string) => {
              switch (sev.toLowerCase()) {
                case 'critical':
                  return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
                case 'high':
                  return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
                case 'medium':
                  return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
                default:
                  return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
              }
            };

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl theme-card-bg border border-slate-200 dark:border-slate-700/60 text-xs hover:border-slate-400 dark:hover:border-slate-500 transition shadow-sm"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full theme-badge flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{z.zone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{z.risk_count} risks</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getSevBadge(z.max_severity)}`}>
                    {z.max_severity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
