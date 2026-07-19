import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import LiveSnapshot from './LiveSnapshot';
import type { AirQualityData, City } from '../../types';

interface HeroSectionProps {
  cities: City[];
  worstCity: { name: string; aqi: number } | null;
  activeAnomalies: number;
  airQualityMap: Record<string, AirQualityData | null>;
  onEnterCommandCentre: () => void;
}

const DEATH_COUNT_TARGET = 1.67;
const DEATH_COUNT_UNIT = 'M';

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(2)}
      <span className="text-2xl ml-1">{suffix}</span>
    </span>
  );
}

export default function HeroSection({
  cities, worstCity, activeAnomalies, airQualityMap, onEnterCommandCentre,
}: HeroSectionProps) {
  const [show, setShow] = useState(true);

  // Hide hero once user clicks enter
  const handleEnter = () => {
    setShow(false);
    onEnterCommandCentre();
  };

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-16 py-12 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Problem Statement */}
      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Death count */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-red-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            The Problem
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
            <span className="text-red-600">
              <AnimatedCounter target={DEATH_COUNT_TARGET} suffix={DEATH_COUNT_UNIT} />
            </span>
            <span className="block text-2xl md:text-3xl text-slate-700 mt-2 font-semibold">
              premature deaths annually from air pollution
            </span>
          </h1>
        </div>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-8 leading-relaxed">
          900+ monitoring stations exist. Almost none translate to action.{' '}
          <span className="text-slate-800 font-semibold">UrbanBreathe closes that gap.</span>
        </p>

        {/* Live Snapshot Strip */}
        <LiveSnapshot
          cities={cities}
          worstCity={worstCity}
          activeAnomalies={activeAnomalies}
          airQualityMap={airQualityMap}
        />

        {/* CTA */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={handleEnter}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl
              hover:bg-brand-600 transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
          >
            Enter Command Centre
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-400 self-center">
            Real-time air quality monitoring &bull; AI-powered analysis &bull; Policy simulation
          </p>
        </div>
      </div>
    </div>
  );
}
