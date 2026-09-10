import React from 'react';
import { SafetyAnalyticsResponse } from '../types';
import { MapPin, Users, Lightbulb, ShieldAlert } from 'lucide-react';

interface AccidentZonesAnalyticsProps {
  analytics: SafetyAnalyticsResponse | null;
}

export const AccidentZonesAnalytics: React.FC<AccidentZonesAnalyticsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="glass-panel p-5 rounded-xl animate-pulse text-slate-400 text-center text-xs">
        Loading Safety Analytics & Recommendations...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Dynamic Accident-Prone Zones */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Accident-Prone Site Zones</h4>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-56 pr-1 text-xs">
          {analytics.accident_prone_zones.map((z, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{z.zone}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {z.incident_count} incidents • {z.violation_count} PPE breaches
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                z.risk_level === 'High'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  : z.risk_level === 'Medium'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}>
                {z.risk_level} Exposure
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Unsafe Behavior & Repeat Violators */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Repeat Safety Violators</h4>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-56 pr-1 text-xs">
          {analytics.repeat_violators.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">No repeat safety violators detected.</p>
          ) : (
            analytics.repeat_violators.map((v, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                    {v.worker_id}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Worker Badge #{v.worker_id}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Frequent Breach: <span className="text-amber-600 dark:text-amber-300 font-medium">{v.frequent_type}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {v.violations_count} breaches
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Plain-Language AI Safety Recommendations */}
      <div className="glass-panel p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Lightbulb className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">AI Safety Recommendations</h4>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1 text-xs">
          {analytics.safety_recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-900 dark:text-cyan-100 flex items-start space-x-2.5 leading-relaxed"
            >
              <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
