import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'low' | 'medium' | 'high' | 'critical' | 'neutral';
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  trend,
  trendPositive,
}) => {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'low':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-500 border-orange-500/30';
      case 'critical':
        return 'bg-red-500/15 text-red-500 border-red-500/30';
      default:
        return 'theme-badge';
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2.5 rounded-lg theme-badge group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-black tracking-tight">{value}</span>
        {badgeText && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}

      {trend && (
        <div className="mt-2 text-xs font-medium flex items-center space-x-1">
          <span className={trendPositive ? 'text-emerald-500' : 'text-rose-500'}>{trend}</span>
          <span className="text-slate-400">vs last week</span>
        </div>
      )}
    </div>
  );
};
