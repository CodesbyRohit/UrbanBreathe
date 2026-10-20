import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { formatIndex } from '../../utils/provenance';
import { project, kmToMapUnits, labelSides } from '../../utils/mapProjection';
import { useAqiColor } from '../../hooks/useTheme';
import { INDIA_OUTLINE } from './indiaOutline';

interface IndiaMapProps {
  cities: City[];
  selectedId: string;
  airQualityMap: Record<string, AirQualityData | null>;
  onSelect: (id: string) => void;
}

const SCALE_KM = 500;
const SCALE_LAT = 22; // scale bar is true east–west at ~22°N (centre of the map)

/**
 * Schematic locator map. Marker colour shows the CPCB category of each city's
 * NAQI-method estimate and the number is printed beside it. Each marker is a
 * city-centre point for a ~45 km model grid cell, not a measurement location.
 * The SVG is decorative for assistive technology; the city list below it is
 * the accessible (and keyboard) alternative.
 */
export default function IndiaMap({ cities, selectedId, airQualityMap, onSelect }: IndiaMapProps) {
  const aqiColor = useAqiColor();
  const points = useMemo(() => cities.map(c => ({ city: c, ...project(c.lat, c.lon) })), [cities]);
  const sides = useMemo(() => labelSides(points.map(p => ({ id: p.city.id, x: p.x, y: p.y }))), [points]);
  const scaleWidth = kmToMapUnits(SCALE_KM, SCALE_LAT);

  return (
    <div className="panel p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MapPin size={15} className="text-brand-600" aria-hidden="true" /> Cities
        </h3>
        <span className="text-xs text-slate-500">Colour and number: current NAQI-method estimate (modelled)</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <svg viewBox="0 0 400 500" className="w-full max-w-[340px] mx-auto h-auto" aria-hidden="true" focusable="false">
          <path d={INDIA_OUTLINE} fill="none" stroke="#94a3b8" strokeWidth="1" />
          {points.map(({ city, x, y }) => {
            const aq = airQualityMap[city.id];
            const isSelected = city.id === selectedId;
            const color = aqiColor(aq?.aqi ?? null);
            const left = sides[city.id] === 'left';
            const tx = left ? x - 9 : x + 9;
            return (
              <g key={city.id} onClick={() => onSelect(city.id)} className="cursor-pointer">
                {isSelected && <circle cx={x} cy={y} r="10" fill="none" stroke="#2675dc" strokeWidth="2.5" />}
                <circle cx={x} cy={y} r="6" fill={color} stroke="#fff" strokeWidth="1.5" />
                <text x={tx} y={y - 1} textAnchor={left ? 'end' : 'start'} className={`text-[11px] fill-current ${isSelected ? 'font-bold text-brand-700' : 'font-semibold text-slate-700'}`}>
                  {city.name}
                </text>
                <text x={tx} y={y + 10} textAnchor={left ? 'end' : 'start'} className="text-[10px] font-semibold" fill={color}>
                  {aq === undefined ? '…' : formatIndex(aq?.aqi ?? null, aq?.aqiIsLowerBound)}
                </text>
              </g>
            );
          })}
          <g className="fill-current text-slate-600" stroke="#64748b" strokeWidth="1">
            <line x1="20" y1="482" x2={20 + scaleWidth} y2="482" />
            <line x1="20" y1="478" x2="20" y2="486" />
            <line x1={20 + scaleWidth} y1="478" x2={20 + scaleWidth} y2="486" />
            <text x={20 + scaleWidth / 2} y="474" textAnchor="middle" stroke="none" className="text-[10px]">≈{SCALE_KM} km</text>
          </g>
        </svg>

        <ul className="grid grid-cols-2 gap-1 content-start" aria-label="Cities and current NAQI-method estimates">
          {cities.map(city => {
            const aq = airQualityMap[city.id];
            const isSelected = city.id === selectedId;
            const status = aq === undefined ? 'loading' : aq?.aqi == null ? 'no estimate' : aq.aqiCategory;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => onSelect(city.id)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                    isSelected ? 'bg-brand-50 border-brand-200' : 'border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: aqiColor(aq?.aqi ?? null) }} aria-hidden="true" />
                  <span className={`font-medium truncate ${isSelected ? 'text-brand-700' : 'text-slate-700'}`}>{city.name}</span>
                  <span className="ml-auto font-mono tabular text-slate-700">
                    {aq === undefined ? '…' : formatIndex(aq?.aqi ?? null, aq?.aqiIsLowerBound)}
                  </span>
                  <span className="sr-only">, {status}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Points are city centres on a schematic outline; each estimate represents a ~45 km model grid cell, not a street or station. “--” means no valid estimate.
      </p>
    </div>
  );
}
