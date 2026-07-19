import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Shield, CheckCircle, AlertCircle, Skull, Smile } from 'lucide-react';

interface AQIGaugeProps {
  aqi: number;
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  prevAqi?: number;
}

function getSeverityIcon(aqi: number): React.ReactNode {
  if (aqi <= 50) return <Smile size={14} className="text-green-700" />;
  if (aqi <= 100) return <CheckCircle size={14} className="text-lime-700" />;
  if (aqi <= 200) return <AlertCircle size={14} className="text-yellow-700" />;
  if (aqi <= 300) return <AlertTriangle size={14} className="text-orange-700" />;
  if (aqi <= 400) return <AlertTriangle size={14} className="text-red-700" />;
  return <Skull size={14} className="text-purple-700" />;
}

function getSeverityPattern(aqi: number): string {
  if (aqi <= 50) return '';
  if (aqi <= 100) return '';
  if (aqi <= 200) return 'diagonal-stripes';
  if (aqi <= 300) return 'diagonal-stripes';
  if (aqi <= 400) return 'cross-hatch';
  return 'cross-hatch';
}

export default function AQIGauge({ aqi, label, color, size = 'md', prevAqi }: AQIGaugeProps) {
  // Animation target and start
  const targetAqi = Math.max(0, Math.round(aqi));
  const startAqi = prevAqi !== undefined ? Math.max(0, Math.round(prevAqi)) : targetAqi;

  const [displayValue, setDisplayValue] = useState(startAqi);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const start = startAqi;
    const end = targetAqi;
    const duration = 250;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [targetAqi, startAqi]);

  const normalized = Math.min(targetAqi, 500) / 500;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - normalized * circumference;

  const dims = size === 'sm'
    ? { svg: 100, stroke: 8, text: 'text-lg', sub: 'text-[10px]', badgeSize: 'text-[10px]' }
    : size === 'lg'
    ? { svg: 160, stroke: 14, text: 'text-3xl', sub: 'text-xs', badgeSize: 'text-xs' }
    : { svg: 128, stroke: 10, text: 'text-2xl', sub: 'text-[11px]', badgeSize: 'text-[11px]' };

  const pattern = getSeverityPattern(targetAqi);
  const severityIcon = getSeverityIcon(targetAqi);

  return (
    <div className="flex flex-col items-center relative">
      {/* Severity badge - visible from a distance */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold mb-2 ${dims.badgeSize}`}
        style={{
          backgroundColor: color + '15',
          color: color,
          border: `1px solid ${color}30`,
        }}
        role="status"
        aria-label={`Air quality: ${label}`}
      >
        {severityIcon}
        <span>{label}</span>
      </div>

      <div className="relative">
        <svg width={dims.svg} height={dims.svg} viewBox="0 0 128 128" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={dims.stroke}
          />
          {/* Pattern overlay for color-blind accessibility */}
          {pattern && (
            <circle
              cx="64" cy="64" r="54"
              fill="none"
              stroke={color}
              strokeWidth={dims.stroke}
              strokeDasharray={pattern === 'diagonal-stripes' ? '4 6' : '2 4'}
              strokeLinecap="butt"
              strokeDashoffset={offset}
              opacity={0.4}
            />
          )}
          {/* Foreground ring */}
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={color}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-[250ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold font-mono ${dims.text}`}
            style={{ color }}
            aria-live="polite"
            aria-label={`AQI ${displayValue}`}
          >
            {displayValue}
          </span>
          <span className={`${dims.sub} font-semibold text-slate-500 uppercase tracking-wider`}>
            AQI
          </span>
        </div>
      </div>
    </div>
  );
}
