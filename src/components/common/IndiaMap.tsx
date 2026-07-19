import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { getAQIColor } from '../../utils/formatters';

interface IndiaMapProps {
  cities: City[];
  selectedId: string;
  airQualityMap: Record<string, AirQualityData | null>;
  anomalyMap: Record<string, boolean>;
  onSelect: (id: string) => void;
  compact?: boolean;
}

interface CityPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  state: string;
}

// SVG viewBox: 0 0 400 500
// Mapping: lon 68->97 → x 0->400, lat 8->37 → y 500->0
function computeCityPositions(cities: City[]): CityPosition[] {
  const lonRange = 97 - 68; // 29
  const latRange = 37 - 8;  // 29

  return cities.map(c => ({
    id: c.id,
    name: c.name,
    state: c.state,
    x: ((c.lon - 68) / lonRange) * 400,
    y: ((37 - c.lat) / latRange) * 500,
  }));
}

// Simplified India outline path (approximate boundary traced from reference)
const INDIA_OUTLINE = `M 142,8 
  L 170,18 L 188,26 L 200,38 L 220,42 L 240,46 
  L 256,56 L 268,68 L 278,82 L 286,98 L 294,116 
  L 300,132 L 306,150 L 310,166 L 316,184 L 320,200 
  L 318,216 L 310,232 L 298,248 L 286,262 L 278,278 
  L 266,296 L 250,316 L 236,338 L 224,358 L 214,376 
  L 206,394 L 198,410 L 190,426 L 182,436 L 174,442 
  L 166,444 L 158,440 L 150,432 L 142,420 L 134,406 
  L 126,390 L 118,372 L 110,354 L 102,334 L 96,312 
  L 90,290 L 84,268 L 78,246 L 72,224 L 68,202 
  L 66,180 L 70,158 L 76,138 L 84,118 L 94,100 
  L 106,84 L 118,68 L 130,52 L 128,38 L 134,22 Z`;

export default function IndiaMap({
  cities, selectedId, airQualityMap, anomalyMap, onSelect, compact,
}: IndiaMapProps) {
  const positions = useMemo(() => computeCityPositions(cities), [cities]);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${compact ? 'p-3' : 'p-4 md:p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-brand-500" />
          <h3 className="text-sm font-semibold text-slate-700">City Network</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> 
            Anomaly
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> 
            Normal
          </span>
        </div>
      </div>

      {/* Map SVG */}
      <div className="relative w-full max-w-[400px] mx-auto">
        <svg
          viewBox="0 0 400 500"
          className="w-full h-auto"
          aria-label="Map of India showing monitored cities"
          role="img"
        >
          {/* India outline */}
          <path
            d={INDIA_OUTLINE}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="theme-light:stroke-slate-300"
          />

          {/* City markers */}
          {positions.map(pos => {
            const city = cities.find(c => c.id === pos.id);
            const aqData = city ? airQualityMap[city.id] : null;
            const aqi = aqData?.aqi ?? (city?.baseAQI ?? 150);
            const isAnomaly = anomalyMap[pos.id] ?? false;
            const isSelected = pos.id === selectedId;
            const color = getAQIColor(aqi);

            return (
              <g
                key={pos.id}
                onClick={() => onSelect(pos.id)}
                className="cursor-pointer"
                role="button"
                aria-label={`${pos.name}, AQI ${aqi}`}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(pos.id); } }}
              >
                {/* Pulse ring for anomalies */}
                {isAnomaly && (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="10"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className="animate-ping"
                      opacity={0.4}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="12"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      opacity={0.2}
                    />
                  </>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill="none"
                    stroke="#3b91e8"
                    strokeWidth="2"
                    opacity={0.5}
                  />
                )}

                {/* Marker dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="5"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  className={`transition-all duration-200 ${
                    isAnomaly ? 'animate-pulse' : ''
                  }`}
                  style={{
                    filter: isAnomaly
                      ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))'
                      : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                  }}
                />

                {/* City label */}
                <text
                  x={pos.x}
                  y={pos.y - 10}
                  textAnchor="middle"
                  className={`text-[9px] font-semibold fill-slate-600 ${
                    isSelected ? 'fill-brand-600 font-bold' : ''
                  }`}
                >
                  {pos.name}
                </text>

                {/* AQI badge */}
                <rect
                  x={pos.x - 14}
                  y={pos.y + 8}
                  width="28"
                  height="12"
                  rx="3"
                  fill={color}
                  opacity="0.9"
                />
                <text
                  x={pos.x}
                  y={pos.y + 16}
                  textAnchor="middle"
                  className="text-[7px] font-bold fill-white"
                >
                  {aqi}
                </text>
              </g>
            );
          })}

          {/* Scale bar */}
          <line x1="20" y1="480" x2="80" y2="480" stroke="#94a3b8" strokeWidth="1" />
          <line x1="20" y1="476" x2="20" y2="484" stroke="#94a3b8" strokeWidth="1" />
          <line x1="80" y1="476" x2="80" y2="484" stroke="#94a3b8" strokeWidth="1" />
          <text x="50" y="475" textAnchor="middle" className="text-[8px] fill-slate-400">
            500 km
          </text>
        </svg>
      </div>

      {/* City list below map (mobile-friendly) */}
      {!compact && (
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {positions.map(pos => {
          const city = cities.find(c => c.id === pos.id);
          const aqData = city ? airQualityMap[city.id] : null;
          const aqi = aqData?.aqi ?? (city?.baseAQI ?? 150);
          const isAnomaly = anomalyMap[pos.id] ?? false;
          const isSelected = pos.id === selectedId;
          const color = getAQIColor(aqi);

          return (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                isSelected
                  ? 'bg-brand-50 border border-brand-200'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isAnomaly ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: color }}
              />
              <span className={`font-medium ${isSelected ? 'text-brand-700' : 'text-slate-600'}`}>
                {pos.name}
              </span>
              <span className="font-mono text-[10px] text-slate-400 ml-auto">{aqi}</span>
              {isAnomaly && (
                <span className="text-[9px] text-red-500 font-semibold">!</span>
              )}
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
