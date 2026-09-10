import React from 'react';
import { PPEComplianceResponse } from '../types';
import { HardHat, Shield, Footprints, Hand, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PPETypeBreakdownProps {
  complianceData: PPEComplianceResponse | null;
}

export const PPETypeBreakdown: React.FC<PPETypeBreakdownProps> = ({ complianceData }) => {
  if (!complianceData) {
    return (
      <div className="glass-panel p-5 rounded-xl animate-pulse text-slate-400 text-center text-xs">
        Loading PPE Compliance breakdown...
      </div>
    );
  }

  const ppeIcons: Record<string, any> = {
    'hard hat': HardHat,
    'vest': Shield,
    'boots': Footprints,
    'gloves': Hand,
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-500';
    if (rate >= 85) return 'bg-cyan-500';
    if (rate >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const items = Object.values(complianceData.breakdown_by_type);

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Safety Compliance by PPE Category</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Real-time Computer Vision (CV) compliance tracking by gear type
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
          Overall: {complianceData.overall_compliance_rate}%
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const keyLower = item.ppe_type.toLowerCase();
          const Icon = ppeIcons[keyLower] || HardHat;
          const isHighRate = item.compliance_rate >= 90;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-slate-200/80 dark:bg-slate-700/70 text-cyan-600 dark:text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.ppe_type}</span>
                </div>
                {isHighRate ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                )}
              </div>

              <div className="mt-2">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{item.compliance_rate}%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {item.violations_count} violations
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.compliance_rate)}`}
                    style={{ width: `${Math.max(5, item.compliance_rate)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
