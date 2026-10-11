import React, { useState } from 'react';
import { Wind, Beaker, Sun, Info } from 'lucide-react';
import type { AirQualityData } from '../../types';
import { getAQIColor } from '../../utils/formatters';
import { formatValue, formatIndex } from '../../utils/provenance';

interface PollutantCardProps {
  pollutant: {
    key: string;
    label: string;
    unit: string;
    icon: string;
    description: string;
  };
  data: AirQualityData;
}

const iconMap: Record<string, React.ReactNode> = {
  Wind: <Wind size={16} />,
  Beaker: <Beaker size={16} />,
  Sun: <Sun size={16} />,
};

export default function PollutantCard({ pollutant, data }: PollutantCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const value = data[pollutant.key as 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co'];
  const sub = data.naqi.subIndices[pollutant.key];
  const subOk = sub?.status === 'ok';
  const color = getAQIColor(subOk ? sub.subIndex : null);

  const toggleDetail = () => setShowDetail(prev => !prev);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 card-hover relative"
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
      onFocus={() => setShowDetail(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShowDetail(false); }}
      onClick={toggleDetail}
      role="button"
      tabIndex={0}
      aria-expanded={showDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDetail(); }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{iconMap[pollutant.icon]}</span>
          <span className="text-sm font-semibold text-slate-800">{pollutant.label}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-500">{pollutant.unit}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-900">{formatValue(value)}</span>
        <span className="text-[10px] text-slate-500">hourly</span>
      </div>
      <p className="text-[11px] mt-1 font-medium" style={{ color }}>
        {subOk
          ? `${sub.averagingHours}-h mean: ${sub.category} (sub-index ${formatIndex(sub.subIndex, sub.isLowerBound)})`
          : sub ? `${sub.averagingHours}-h mean: insufficient data` : 'No sub-index'}
      </p>

      {showDetail && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-xs animate-scale-in">
          <div className="flex items-start gap-1.5">
            <Info size={12} className="text-brand-500 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-medium text-slate-700">{pollutant.label} — {pollutant.description}</p>
              <p className="text-slate-500">Hourly modelled value: <span className="font-mono">{formatValue(value)} {pollutant.unit}</span></p>
              {sub && (
                <p className="text-slate-500">
                  {sub.averagingHours}-hour mean: <span className="font-mono">{sub.average ?? '--'} {sub.unit === 'mg/m3' ? 'mg/m³' : 'µg/m³'}</span>
                  {' '}({sub.validHours}/{sub.averagingHours} h valid, {sub.requiredHours} required)
                </p>
              )}
              <p className="text-slate-500">Categories use CPCB NAQI breakpoints for the averaged concentration.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
