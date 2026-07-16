import React from 'react';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  color?: string;
  subtitle?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color,
  subtitle,
}: MetricCardProps) {
  const trendIcon = trend === 'up' ? <ChevronUp size={14} /> :
    trend === 'down' ? <ChevronDown size={14} /> :
    trend === 'stable' ? <Minus size={14} /> : null;

  const trendColor = trend === 'up' ? 'text-red-500' :
    trend === 'down' ? 'text-teal-500' :
    trend === 'stable' ? 'text-slate-400' : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-xl font-bold text-slate-900"
          style={color ? { color } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>
      {(trend || subtitle) && (
        <div className="flex items-center gap-3 mt-1">
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
              {trendIcon}
              {trendLabel || trend}
            </span>
          )}
          {subtitle && <span className="text-[11px] text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
