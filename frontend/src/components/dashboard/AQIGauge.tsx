import React from 'react';

interface AQIGaugeProps {
  aqi: number | string;
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AQIGauge({ aqi, label, color, size = 'md' }: AQIGaugeProps) {
  const aqiNum = typeof aqi === 'string' ? parseInt(aqi) || 0 : aqi;
  const normalized = Math.min(aqiNum, 500) / 500;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - normalized * circumference;

  const dims = size === 'sm' ? { svg: 100, stroke: 8, text: 'text-lg', sub: 'text-[10px]' } :
    size === 'lg' ? { svg: 160, stroke: 14, text: 'text-3xl', sub: 'text-xs' } :
    { svg: 128, stroke: 10, text: 'text-2xl', sub: 'text-[11px]' };

  return (
    <div className="flex flex-col items-center relative">
      <svg width={dims.svg} height={dims.svg} viewBox="0 0 128 128" className="transform -rotate-90">
        <circle
          cx="64" cy="64" r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={dims.stroke}
        />
        <circle
          cx="64" cy="64" r="54"
          fill="none"
          stroke={color}
          strokeWidth={dims.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: dims.svg, height: dims.svg }}>
        <span className={`${dims.text} font-bold`} style={{ color }}>
          {aqi}
        </span>
        <span className={`${dims.sub} font-semibold text-slate-500 uppercase tracking-wider`}>
          {label}
        </span>
      </div>
    </div>
  );
}
