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
// Mapping: lon 67->98 → x 0->400, lat 6->38 → y 500->0
// (slightly wider bounds than the raw city data to keep mainland well inside the viewBox)
function computeCityPositions(cities: City[]): CityPosition[] {
  const lonMin = 67;
  const lonMax = 98;
  const latMin = 6;
  const latMax = 38;
  const lonRange = lonMax - lonMin; // 31
  const latRange = latMax - latMin; // 32

  return cities.map(c => ({
    id: c.id,
    name: c.name,
    state: c.state,
    x: ((c.lon - lonMin) / lonRange) * 400,
    y: ((latMax - c.lat) / latRange) * 500,
  }));
}

// Accurate India outline from Natural Earth 110m data (CC0), simplified via Douglas-Peucker
const INDIA_OUTLINE = `M 139.36,39.13 L 142.51,39.19 L 145.76,52.74 L 154.21,57.04 L 151.36,61.26 L 152.27,70.40 L 160.72,74.21 L 159.14,78.21 L 162.76,81.80 L 160.56,85.39 L 154.11,88.34 L 151.44,83.91 L 146.90,85.19 L 151.54,94.31 L 151.55,104.56 L 156.53,102.52 L 160.02,109.01 L 165.81,110.09 L 170.64,113.53 L 170.06,116.26 L 180.69,121.68 L 172.50,128.78 L 168.21,143.17 L 182.83,150.60 L 184.47,154.25 L 191.69,158.58 L 202.32,161.02 L 203.25,164.14 L 210.10,166.70 L 211.45,164.52 L 217.48,166.48 L 220.87,163.85 L 227.18,167.02 L 227.62,171.43 L 235.96,175.98 L 240.12,174.20 L 242.95,178.65 L 248.83,177.94 L 254.37,181.02 L 258.60,178.43 L 261.94,182.09 L 269.29,180.24 L 270.65,181.77 L 273.15,175.87 L 270.57,170.14 L 272.26,157.37 L 278.85,154.60 L 282.00,158.45 L 280.54,163.57 L 282.48,166.94 L 280.39,169.52 L 285.12,174.67 L 294.37,176.62 L 301.28,173.49 L 306.03,175.51 L 321.01,174.95 L 323.52,173.63 L 323.73,167.31 L 322.26,164.49 L 317.48,163.56 L 316.96,158.57 L 321.96,160.55 L 330.00,158.63 L 331.34,154.17 L 338.17,150.93 L 339.58,146.82 L 347.46,145.58 L 356.13,135.68 L 366.03,140.05 L 370.90,135.31 L 375.16,134.85 L 378.92,136.61 L 376.71,141.55 L 380.10,140.71 L 381.84,144.41 L 378.09,149.68 L 388.59,150.52 L 391.77,156.33 L 385.32,162.51 L 388.63,170.51 L 383.29,166.24 L 376.03,167.85 L 362.87,177.94 L 363.24,186.72 L 356.23,196.96 L 357.53,202.72 L 350.09,220.98 L 339.48,217.75 L 340.32,232.35 L 337.29,233.88 L 337.72,245.95 L 333.90,250.67 L 331.40,247.59 L 330.01,250.35 L 325.93,223.34 L 321.58,223.08 L 319.94,232.98 L 317.24,235.24 L 314.77,230.27 L 313.72,232.80 L 311.44,224.54 L 314.36,217.19 L 320.99,216.28 L 325.46,204.82 L 328.82,204.25 L 323.02,200.29 L 301.48,200.78 L 294.44,198.67 L 294.56,187.82 L 292.30,184.02 L 290.86,188.13 L 288.20,187.52 L 284.44,181.55 L 282.47,181.47 L 284.12,183.84 L 279.53,183.37 L 275.77,177.94 L 275.03,180.23 L 277.39,181.99 L 273.08,185.31 L 272.10,190.14 L 283.68,198.67 L 282.89,200.50 L 276.66,200.16 L 271.25,208.66 L 280.48,214.26 L 277.94,224.22 L 280.91,226.74 L 279.96,230.43 L 283.35,231.21 L 281.79,234.75 L 284.88,247.64 L 284.66,250.96 L 282.65,250.48 L 284.94,255.98 L 282.05,253.64 L 280.10,256.59 L 279.49,246.80 L 278.35,256.91 L 277.36,250.75 L 276.86,255.87 L 275.24,254.39 L 274.96,256.09 L 274.34,253.15 L 274.25,256.96 L 273.52,247.38 L 269.76,243.36 L 273.09,248.60 L 268.83,254.23 L 257.00,260.51 L 256.50,269.05 L 258.62,270.34 L 250.66,281.26 L 247.13,279.01 L 249.97,281.80 L 248.63,282.65 L 238.46,286.46 L 239.62,283.19 L 235.72,284.69 L 233.86,289.40 L 235.45,286.62 L 239.70,286.08 L 228.89,294.57 L 220.81,307.84 L 198.33,326.40 L 197.51,334.69 L 190.49,338.71 L 184.00,338.55 L 180.81,347.22 L 179.31,343.26 L 178.16,348.18 L 176.39,345.19 L 171.35,348.43 L 168.43,357.93 L 170.28,366.17 L 168.34,371.77 L 171.79,383.74 L 169.57,379.24 L 168.43,380.95 L 171.96,383.90 L 172.04,387.53 L 163.56,417.24 L 165.59,416.53 L 165.89,432.92 L 158.53,433.55 L 153.72,445.71 L 160.69,450.64 L 154.70,448.78 L 147.25,451.56 L 142.66,463.07 L 135.62,467.56 L 128.98,463.00 L 123.15,454.49 L 124.75,453.01 L 122.94,453.95 L 120.81,448.04 L 119.18,438.24 L 120.74,444.99 L 122.62,444.77 L 119.23,433.77 L 101.00,393.36 L 102.46,392.52 L 100.87,392.78 L 95.84,367.56 L 91.57,362.60 L 93.36,361.30 L 89.20,358.14 L 88.23,349.05 L 86.69,349.58 L 83.19,342.67 L 80.01,318.96 L 76.48,309.00 L 78.34,308.23 L 75.55,301.86 L 78.15,296.64 L 77.00,294.33 L 74.46,297.68 L 74.65,291.97 L 78.06,293.47 L 74.37,290.93 L 75.86,288.56 L 73.84,288.50 L 72.89,283.56 L 76.73,269.38 L 71.80,259.60 L 79.12,253.78 L 71.62,255.21 L 73.99,250.09 L 70.99,250.37 L 71.94,246.96 L 76.35,245.76 L 66.44,245.66 L 68.49,248.77 L 64.47,253.13 L 68.37,255.84 L 65.87,262.42 L 48.26,270.02 L 39.41,263.23 L 25.09,245.39 L 26.76,242.47 L 28.54,245.72 L 41.01,241.22 L 45.20,232.74 L 43.77,235.30 L 40.40,234.47 L 33.36,238.11 L 24.08,234.06 L 18.37,227.41 L 18.18,224.67 L 23.50,220.65 L 14.75,224.80 L 16.31,219.75 L 22.25,219.29 L 22.55,213.58 L 38.35,216.17 L 44.08,212.47 L 48.46,215.13 L 52.68,212.32 L 47.15,192.59 L 41.93,192.07 L 39.54,187.81 L 40.75,179.22 L 32.31,176.01 L 32.70,169.91 L 43.12,156.07 L 45.61,156.00 L 49.44,160.91 L 62.90,156.88 L 69.09,144.26 L 76.52,139.88 L 82.20,126.14 L 89.60,122.06 L 88.41,119.18 L 98.82,108.07 L 96.86,106.63 L 97.42,96.45 L 107.86,89.66 L 99.22,86.39 L 99.17,80.76 L 94.79,81.77 L 94.34,78.21 L 90.35,75.35 L 92.36,70.40 L 89.89,66.65 L 93.84,63.09 L 88.95,61.65 L 90.20,59.09 L 87.42,56.70 L 89.28,52.46 L 94.82,50.42 L 113.49,54.56 L 116.43,51.92 L 124.55,50.83 L 139.36,39.13 Z`;

/**
 * Compute label offset for nearby cities to prevent overlap.
 * Returns { dy: number, anchor: string } — vertical offset in px and text-anchor.
 */
function getLabelOffset(pos: CityPosition, allPositions: CityPosition[]): { dy: number; anchor: 'start' | 'middle' | 'end' } {
  const threshold = 18; // px — minimum vertical distance before we offset
  for (const other of allPositions) {
    if (other.id === pos.id) continue;
    const dx = Math.abs(pos.x - other.x);
    const dy = Math.abs(pos.y - other.y);
    // Nearby city: same horizontal region and close vertically
    if (dx < 40 && dy < threshold) {
      if (pos.y < other.y) {
        // This city is above the other — shift label further up
        return { dy: -6, anchor: 'middle' };
      } else {
        // This city is below — shift label further down
        return { dy: 16, anchor: 'middle' };
      }
    }
  }
  return { dy: -10, anchor: 'middle' }; // default: above the dot
}

export default function IndiaMap({
  cities, selectedId, airQualityMap, anomalyMap, onSelect, compact,
}: IndiaMapProps) {
  const positions = useMemo(() => computeCityPositions(cities), [cities]);
  // Memoized per-city AQI colors — avoids re-calling getAQIColor on every render
  const cityColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const city of cities) {
      const aqData = airQualityMap[city.id];
      const aqi = aqData?.aqi ?? city.baseAQI ?? 150;
      map[city.id] = getAQIColor(aqi);
    }
    return map;
  }, [cities, airQualityMap]);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${compact ? 'p-3' : 'p-4 md:p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-700">City Network</h2>
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
            const color = cityColors[pos.id];

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

                {/* City label with collision avoidance */}
                {(() => {
                  const offset = getLabelOffset(pos, positions);
                  return (
                    <text
                      x={pos.x}
                      y={pos.y + offset.dy}
                      textAnchor={offset.anchor}
                      className={`text-[9px] font-semibold fill-slate-600 ${
                        isSelected ? 'fill-brand-600 font-bold' : ''
                      }`}
                    >
                      {pos.name}
                    </text>
                  );
                })()}

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
          <text x="50" y="475" textAnchor="middle" className="text-[8px] fill-slate-600">
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
          const color = cityColors[pos.id];

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
