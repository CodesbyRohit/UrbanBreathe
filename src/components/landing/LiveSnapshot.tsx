import React from 'react';
import { MapPin, Activity, AlertTriangle } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { getAQIColor } from '../../utils/formatters';

interface LiveSnapshotProps {
  cities: City[];
  worstCity: { name: string; aqi: number } | null;
  activeAnomalies: number;
  airQualityMap: Record<string, AirQualityData | null>;
}

export default function LiveSnapshot({
  cities, worstCity, activeAnomalies, airQualityMap,
}: LiveSnapshotProps) {
  const cards = [
    {
      icon: <MapPin size={16} />,
      label: 'Cities Monitored',
      value: String(cities.length),
      sub: 'Across India',
      color: '#3b91e8',
    },
    {
      icon: <Activity size={16} />,
      label: 'Worst AQI',
      value: worstCity ? String(worstCity.aqi) : '--',
      sub: worstCity?.name || 'N/A',
      color: worstCity ? getAQIColor(worstCity.aqi) : '#94a3b8',
    },
    {
      icon: <AlertTriangle size={16} />,
      label: 'Active Anomalies',
      value: String(activeAnomalies),
      sub: 'Events detected',
      color: activeAnomalies > 0 ? '#ef4444' : '#16a34a',
    },
    {
      icon: <Activity size={16} />,
      label: 'Data Sources',
      value: 'Open-Meteo',
      sub: 'Real-time API',
      color: '#65a30d',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: card.color }}>{card.icon}</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono" style={{ color: card.color }}>
            {card.value}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
