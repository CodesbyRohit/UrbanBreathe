import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUpDown } from 'lucide-react';
import type { City, AirQualityData, Forecast } from '../../types';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import { formatIndex } from '../../utils/provenance';
import { getForecast } from '../../services/api';
import { POLLUTANT_LABELS } from '../../utils/constants';

interface ComparativeIntelligenceProps {
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
}

interface CityComparison {
  cityId: string;
  cityName: string;
  cityState: string;
  aqi: number | null;
  isLowerBound: boolean;
  aqiColor: string;
  dominant: string;
  isDemo: boolean;
  forecastPeak: number | null;
  forecastPeakIsLowerBound: boolean;
}

type SortKey = 'aqi_desc' | 'aqi_asc' | 'name';

const byAqi = (dir: 1 | -1) => (a: CityComparison, b: CityComparison) => {
  if (a.aqi === null && b.aqi === null) return a.cityName.localeCompare(b.cityName);
  if (a.aqi === null) return 1;
  if (b.aqi === null) return -1;
  return dir * (a.aqi - b.aqi);
};

export default function ComparativeIntelligence({ cities, airQualityMap }: ComparativeIntelligenceProps) {
  const [forecasts, setForecasts] = useState<Record<string, Forecast | null>>({});
  const [sortKey, setSortKey] = useState<SortKey>('aqi_desc');

  useEffect(() => {
    if (cities.length === 0) return;
    Promise.allSettled(cities.map(c => getForecast(c.id).then(d => ({ id: c.id, data: d })))).then(results => {
      const map: Record<string, Forecast | null> = {};
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.data; });
      setForecasts(map);
    });
  }, [cities]);

  const comparisons = useMemo((): CityComparison[] => {
    return cities
      .map(city => {
        const aq = airQualityMap[city.id];
        const fc = forecasts[city.id];
        return {
          cityId: city.id,
          cityName: city.name,
          cityState: city.state,
          aqi: aq?.aqi ?? null,
          isLowerBound: aq?.aqiIsLowerBound ?? false,
          aqiColor: getAQIColor(aq?.aqi ?? null),
          dominant: aq ? aq.naqi.dominantPollutants.map(p => POLLUTANT_LABELS[p] || p).join(', ') : '',
          isDemo: aq?.provenance.mode === 'demo',
          forecastPeak: fc?.peak?.naqi ?? null,
          forecastPeakIsLowerBound: fc?.peak?.naqiIsLowerBound ?? false,
        };
      })
      .sort(sortKey === 'name' ? (a, b) => a.cityName.localeCompare(b.cityName) : byAqi(sortKey === 'aqi_desc' ? -1 : 1));
  }, [cities, airQualityMap, forecasts, sortKey]);

  const chartData = comparisons.filter(c => c.aqi !== null).map(c => ({ name: c.cityName, value: c.aqi, fill: c.aqiColor }));

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'aqi_desc', label: 'Highest estimate' },
    { key: 'aqi_asc', label: 'Lowest estimate' },
    { key: 'name', label: 'City name' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">City Comparison</h2>
          <p className="text-sm text-slate-500">Current NAQI-method estimates and model-forecast peaks (modelled CAMS data)</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <ArrowUpDown size={14} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-500">Sort:</span>
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            aria-pressed={sortKey === opt.key}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortKey === opt.key ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisons.map(c => (
          <div key={c.cityId} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{c.cityName}</h3>
                <p className="text-[10px] text-slate-500">{c.cityState}</p>
              </div>
              {c.isDemo && <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-1.5 rounded">DEMO</span>}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold font-mono" style={{ color: c.aqiColor }}>{formatIndex(c.aqi, c.isLowerBound)}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: c.aqiColor + '18', color: c.aqiColor }}>
                {getAQILabel(c.aqi)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 mt-1">
              <span>Dominant pollutant: <span className="font-medium text-slate-700">{c.dominant || '—'}</span></span>
              <span>72-h model peak: <strong>{formatIndex(c.forecastPeak, c.forecastPeakIsLowerBound)}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">NAQI-method estimate by city</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-semibold text-slate-900">{d.name}</p>
                    <p className="text-slate-600">NAQI estimate: <strong>{d.value}</strong> ({getAQILabel(d.value)})</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slate-500 mt-3 text-center">
          Bars show NAQI-method estimates from modelled CAMS data, not official CPCB station AQI. Cities without a valid estimate are omitted from the chart.
        </p>
      </div>
    </div>
  );
}
