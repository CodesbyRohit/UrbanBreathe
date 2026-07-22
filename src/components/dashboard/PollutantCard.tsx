import React, { useState } from 'react';
import { Wind, Beaker, Sun, Info } from 'lucide-react';
import type { AirQualityData } from '../../types';
import { getAQIColor, formatConcentration } from '../../utils/formatters';

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

const HEALTH_THRESHOLDS: Record<string, { safe: number; moderate: number; hazardous: number }> = {
  pm25: { safe: 30, moderate: 60, hazardous: 90 },
  pm10: { safe: 100, moderate: 200, hazardous: 350 },
  no2: { safe: 40, moderate: 80, hazardous: 180 },
  o3: { safe: 50, moderate: 100, hazardous: 200 },
  so2: { safe: 40, moderate: 80, hazardous: 160 },
  co: { safe: 2000, moderate: 4000, hazardous: 10000 },
};

export default function PollutantCard({ pollutant, data }: PollutantCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const value = data[pollutant.key as keyof AirQualityData] as number;
  const aqi = value * (pollutant.key === 'pm25' ? 2.5 : 1);
  const color = getAQIColor(aqi);

  const thresholds = HEALTH_THRESHOLDS[pollutant.key];
  const status = thresholds
    ? value >= thresholds.hazardous ? 'Hazardous'
      : value >= thresholds.moderate ? 'Elevated'
      : value >= thresholds.safe ? 'Moderate'
      : 'Good'
    : '—';

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
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDetail(); }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{iconMap[pollutant.icon]}</span>
          <span className="text-sm font-semibold text-slate-800">{pollutant.label}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 uppercase">{pollutant.unit}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-900">
          {formatConcentration(value, pollutant.unit)}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
          status === 'Good' ? 'text-green-700 bg-green-50' :
          status === 'Moderate' ? 'text-yellow-700 bg-yellow-50' :
          status === 'Elevated' ? 'text-orange-700 bg-orange-50' :
          'text-red-700 bg-red-50'
        }`}>
          {status}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mt-1">{pollutant.description}</p>

      {/* Hover detail panel */}
      {showDetail && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-xs animate-scale-in">
          <div className="flex items-start gap-1.5 mb-1.5">
            <Info size={12} className="text-brand-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-700">{pollutant.label} — {pollutant.description}</p>
              <p className="text-slate-500 mt-0.5">
                Current: <span className="font-mono font-medium">{formatConcentration(value, pollutant.unit)}</span>
              </p>
              {thresholds && (
                <div className="mt-1.5 space-y-0.5 text-slate-400">
                  <p>Safe: ≤{thresholds.safe}{pollutant.unit === 'µg/m³' ? ' µg/m³' : ' ppb'}</p>
                  <p>Elevated: &gt;{thresholds.moderate}{pollutant.unit === 'µg/m³' ? ' µg/m³' : ' ppb'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
