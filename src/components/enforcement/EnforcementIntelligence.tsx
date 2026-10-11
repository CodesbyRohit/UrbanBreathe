import React, { useMemo, useState } from 'react';
import { Shield, Info } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import { formatIndex } from '../../utils/provenance';
import { POLLUTANT_LABELS } from '../../utils/constants';

interface EnforcementIntelligenceProps {
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
}

interface PriorityEntry {
  cityId: string;
  cityName: string;
  cityState: string;
  aqi: number | null;
  isLowerBound: boolean;
  category: string | null;
  dominant: string;
  isDemo: boolean;
  loaded: boolean;
}

/**
 * Ranks cities by their NAQI-method estimate only. The previous version combined
 * AQI with an anomaly flag and a "source confidence" score that had no valid
 * basis, and claimed all inputs came from live sensor data.
 */
export default function EnforcementIntelligence({ cities, airQualityMap }: EnforcementIntelligenceProps) {
  const [sortBy, setSortBy] = useState<'aqi' | 'name'>('aqi');

  const entries = useMemo((): PriorityEntry[] => {
    return cities
      .map(city => {
        const aq = airQualityMap[city.id];
        return {
          cityId: city.id,
          cityName: city.name,
          cityState: city.state,
          aqi: aq?.aqi ?? null,
          isLowerBound: aq?.aqiIsLowerBound ?? false,
          category: aq?.aqiCategory ?? null,
          dominant: aq ? aq.naqi.dominantPollutants.map(p => POLLUTANT_LABELS[p] || p).join(', ') : '',
          isDemo: aq?.provenance.mode === 'demo',
          loaded: city.id in airQualityMap,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.cityName.localeCompare(b.cityName);
        if (a.aqi === null && b.aqi === null) return a.cityName.localeCompare(b.cityName);
        if (a.aqi === null) return 1;
        if (b.aqi === null) return -1;
        return b.aqi - a.aqi;
      });
  }, [cities, airQualityMap, sortBy]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Shield size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">City Priority List</h2>
          <p className="text-sm text-slate-500">Cities ranked by their current NAQI-method estimate</p>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-2">
        <Info size={16} className="text-brand-700 mt-0.5 shrink-0" />
        <div className="text-xs text-brand-800 leading-relaxed">
          <p className="font-semibold">How this list is ordered</p>
          <p className="mt-1">
            Highest NAQI-method estimate first. Estimates come from modelled CAMS data, not station measurements,
            and are not official CPCB AQI values. This list is a screening aid, not an inspection or enforcement
            recommendation. Cities without a valid estimate are listed last.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Sort by:</span>
        {([
          { key: 'aqi' as const, label: 'NAQI estimate (highest first)' },
          { key: 'name' as const, label: 'City name' },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            aria-pressed={sortBy === opt.key}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === opt.key ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ol className="space-y-2">
        {entries.map((entry, index) => {
          const color = getAQIColor(entry.aqi);
          return (
            <li key={entry.cityId} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-slate-600">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900">{entry.cityName}</h3>
                    <span className="text-[10px] text-slate-500">{entry.cityState}</span>
                    {entry.isDemo && <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-1.5 rounded">DEMO</span>}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {!entry.loaded
                      ? 'Loading…'
                      : entry.aqi === null
                        ? 'No valid estimate (data unavailable or insufficient)'
                        : `${entry.category} · dominant pollutant: ${entry.dominant}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono" style={{ color }}>{formatIndex(entry.aqi, entry.isLowerBound)}</span>
                  <p className="text-[10px] text-slate-500">{getAQILabel(entry.aqi)}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.min(((entry.aqi ?? 0) / 500) * 100, 100)}%`, backgroundColor: color }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
