import React from 'react';
import { useAqiColor } from '../../hooks/useTheme';

interface AQIGaugeProps {
  aqi: number | null;
  isLowerBound?: boolean;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Ring showing the index on the 0–500 CPCB scale. Static (no count-up
 * animation); the value is exposed once as text for assistive technology.
 */
export default function AQIGauge({ aqi, isLowerBound = false }: AQIGaugeProps) {
  const aqiColor = useAqiColor();
  const hasValue = aqi !== null && Number.isFinite(aqi);
  const value = hasValue ? Math.max(0, Math.round(aqi as number)) : 0;
  const offset = CIRCUMFERENCE - (Math.min(value, 500) / 500) * CIRCUMFERENCE;
  const color = aqiColor(hasValue ? value : null);
  const shown = hasValue ? `${value}${isLowerBound ? '+' : ''}` : '--';

  return (
    <div className="relative w-36 h-36" role="img" aria-label={hasValue ? `NAQI-method estimate ${shown} on a 0 to 500 scale` : 'No NAQI-method estimate available'}>
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--chart-grid)" strokeWidth="10" />
        {hasValue && (
          <circle
            cx="64" cy="64" r={RADIUS} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="text-3xl font-bold tabular" style={{ color }}>{shown}</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NAQI est.</span>
      </div>
    </div>
  );
}
