import React from 'react';
import { Wind, Beaker, Sun } from 'lucide-react';
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

export default function PollutantCard({ pollutant, data }: PollutantCardProps) {
  const value = data[pollutant.key as keyof AirQualityData] as number;
  const aqi = value * (pollutant.key === 'pm25' ? 2.5 : 1);
  const color = getAQIColor(aqi);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{iconMap[pollutant.icon]}</span>
          <span className="text-sm font-semibold text-slate-800">{pollutant.label}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 uppercase">{pollutant.unit}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">
          {formatConcentration(value, pollutant.unit)}
        </span>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      </div>
      <p className="text-[11px] text-slate-500 mt-1">{pollutant.description}</p>
    </div>
  );
}
