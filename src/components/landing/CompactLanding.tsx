import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Heart, FileText, AlertTriangle, Search } from 'lucide-react';
import IndiaMap from '../common/IndiaMap';
import type { NavSection } from '../../utils/constants';
import type { City, AirQualityData } from '../../types';
import { getAQIColor } from '../../utils/formatters';

interface CompactLandingProps {
  cities: City[];
  selectedCityId: string;
  airQualityMap: Record<string, AirQualityData | null>;
  anomalyMap: Record<string, boolean>;
  worstCity: { name: string; aqi: number } | null;
  activeAnomalies: number;
  onSelectCity: (id: string) => void;
  onEnterDashboard: () => void;
  onNavigate: (section: NavSection) => void;
}

function AnimatedCounter() {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const target = 1.67;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return <span className="tabular-nums">{display.toFixed(2)}<span className="text-lg ml-0.5">M</span></span>;
}

const IMPACT_CARDS = [
  {
    icon: <Heart size={16} />,
    label: 'Public Health',
    desc: 'Hospital admissions averted',
    action: 'Run simulation',
    section: 'simulator' as NavSection,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200 hover:border-teal-400',
  },
  {
    icon: <FileText size={16} />,
    label: 'Ops Efficiency',
    desc: 'Briefs in seconds, not hours',
    action: 'View report',
    section: 'brief' as NavSection,
    color: 'text-brand-700',
    bg: 'bg-brand-50',
    border: 'border-brand-200 hover:border-brand-400',
  },
  {
    icon: <AlertTriangle size={16} />,
    label: 'Early Warning',
    desc: 'Live anomaly detection',
    action: 'Monitor',
    section: 'dashboard' as NavSection,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200 hover:border-red-400',
  },
  {
    icon: <Search size={16} />,
    label: 'Explainability',
    desc: 'Source contribution with confidence scoring',
    action: 'View sources',
    section: 'sources' as NavSection,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-400',
  },
];

export default function CompactLanding({
  cities, selectedCityId, airQualityMap, anomalyMap, worstCity, activeAnomalies,
  onSelectCity, onEnterDashboard, onNavigate,
}: CompactLandingProps) {
  // Pre-unlock speechSynthesis so BootSequence can auto-speak without a separate click
  const handleEnterDashboard = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Speak + immediately cancel: primes Chrome's speech engine so subsequent
      // speak() calls from non-gesture contexts (timers) are permitted.
      // Must be called synchronously inside a user gesture (this click handler).
      const unlock = new SpeechSynthesisUtterance(' ');
      window.speechSynthesis.speak(unlock);
      window.speechSynthesis.cancel(); // killed before any audio frame is queued
    }
    sessionStorage.setItem('urbanbreathe_audio_unlocked', 'true');
    onEnterDashboard();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top: Problem statement + impact cards */}
      <div className="flex-1 flex flex-col justify-center px-4 md:px-8 lg:px-12 py-6 max-w-6xl mx-auto w-full">
        {/* Row 1: Headline + stats strip */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
          {/* Left: Problem statement */}
          <div className="lg:w-1/2 shrink-0">
            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              The Problem
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              <span className="text-red-600 text-5xl md:text-6xl">
                <AnimatedCounter />
              </span>
              <span className="block text-lg md:text-xl text-slate-700 mt-1 font-semibold">
                premature deaths annually from air pollution
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-lg leading-relaxed">
              900+ monitoring stations exist. Almost none translate to action.{' '}
              <span className="text-slate-800 font-semibold">UrbanBreathe closes that gap.</span>
            </p>
          </div>

          {/* Right: Stats strip */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-2">
            <StatCard label="Cities" value={String(cities.length)} sub="Across India" color="#2563eb" />
            <StatCard
              label="Worst AQI"
              value={worstCity ? String(worstCity.aqi) : '--'}
              sub={worstCity?.name || 'N/A'}
              color={worstCity ? getAQIColor(worstCity.aqi) : '#475569'}
            />
            <StatCard
              label="Anomalies"
              value={String(activeAnomalies)}
              sub="Active events"
              color={activeAnomalies > 0 ? '#b91c1c' : '#15803d'}
            />
            <StatCard label="Data Source" value="Open-Meteo" sub="Real-time API" color="#4d7c0f" />
          </div>
        </div>

        {/* Row 2: Impact cards + IndiaMap side by side */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Impact cards - compact horizontal */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-2 content-start">
            {IMPACT_CARDS.map((card, i) => (
              <button
                key={card.label}
                onClick={() => onNavigate(card.section)}
                className={`group text-left rounded-lg border p-3 transition-all duration-200 ${card.bg} ${card.border} animate-fade-in`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={card.color}>{card.icon}</span>
                  <span className="text-xs font-semibold text-[#1e293b]">{card.label}</span>
                </div>
                <p className="text-[11px] text-[#334155] leading-snug">{card.desc}</p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#475569] group-hover:text-brand-500 transition-colors mt-1">
                  {card.action} <ArrowRight size={10} />
                </span>
              </button>
            ))}
            {/* CTA button spans the 2-column grid */}
            <button
              onClick={handleEnterDashboard}
              className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 text-white text-xs font-semibold rounded-lg
                hover:bg-brand-800 transition-all duration-200 shadow-sm hover:shadow-md mt-1"
            >
              Enter Command Centre
              <ArrowRight size={14} />
            </button>
          </div>

          {/* IndiaMap - compact */}
          <div className="lg:w-1/2">
            <IndiaMap
              cities={cities}
              selectedId={selectedCityId}
              airQualityMap={airQualityMap}
              anomalyMap={anomalyMap}
              onSelect={onSelectCity}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 hover:shadow-sm transition-shadow duration-200">
      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}
