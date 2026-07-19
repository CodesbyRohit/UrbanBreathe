import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUp, ArrowDown, Minus, ArrowUpDown } from 'lucide-react';
import type { City, AirQualityData, Forecast } from '../../types';
import { getAQIColor, getAQILabel, formatAQI } from '../../utils/formatters';
import { getForecast } from '../../services/api';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../utils/constants';

interface ComparativeIntelligenceProps {
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
}

interface CityComparison {
  cityId: string;
  cityName: string;
  cityState: string;
  aqi: number;
  aqiLabel: string;
  aqiColor: string;
  baseAQI: number;
  trend: 'improving' | 'worsening' | 'stable';
  dominantSource: string;
  sourceColor: string;
  hasAnomaly: boolean;
  anomalyDeviation: number;
  forecastPeak: number | null;
  forecastTrend: string | null;
}

type SortKey = 'aqi_desc' | 'aqi_asc' | 'name' | 'anomaly' | 'trend';

function getTrendIcon(trend: 'improving' | 'worsening' | 'stable') {
  switch (trend) {
    case 'improving':
      return <ArrowDown size={14} className="text-green-600" />;
    case 'worsening':
      return <ArrowUp size={14} className="text-red-500" />;
    case 'stable':
      return <Minus size={14} className="text-slate-400" />;
  }
}

function getTrendLabel(trend: 'improving' | 'worsening' | 'stable') {
  switch (trend) {
    case 'improving': return 'Improving';
    case 'worsening': return 'Worsening';
    case 'stable': return 'Stable';
  }
}

export default function ComparativeIntelligence({ cities, airQualityMap }: ComparativeIntelligenceProps) {
  const [forecasts, setForecasts] = useState<Record<string, Forecast | null>>({});
  const [loadingForecasts, setLoadingForecasts] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('aqi_desc');

  useEffect(() => {
    if (cities.length === 0) return;
    setLoadingForecasts(true);
    Promise.allSettled(
      cities.map(c =>
        getForecast(c.id).then(d => ({ id: c.id, data: d }))
      )
    ).then(results => {
      const map: Record<string, Forecast | null> = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value.data;
      });
      setForecasts(map);
    }).finally(() => setLoadingForecasts(false));
  }, [cities]);

  const comparisons = useMemo((): CityComparison[] => {
    return cities
      .map(city => {
        const aqData = airQualityMap[city.id];
        const aqi = aqData?.aqi ?? city.baseAQI ?? 150;
        const anomaly = aqData?.anomaly;

        // Derive trend from AQI vs baseline
        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        const diff = aqi - city.baseAQI;
        if (diff > city.baseAQI * 0.15) trend = 'worsening';
        else if (diff < -city.baseAQI * 0.15) trend = 'improving';

        const fc = forecasts[city.id];

        return {
          cityId: city.id,
          cityName: city.name,
          cityState: city.state,
          aqi,
          aqiLabel: getAQILabel(aqi),
          aqiColor: getAQIColor(aqi),
          baseAQI: city.baseAQI,
          trend,
          dominantSource: city.dominant || 'unknown',
          sourceColor: SOURCE_COLORS[city.dominant] || '#64748b',
          hasAnomaly: anomaly?.isAnomaly ?? false,
          anomalyDeviation: anomaly?.deviationPercent ?? 0,
          forecastPeak: fc?.peak?.aqi ?? null,
          forecastTrend: fc?.trend ?? null,
        };
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'aqi_asc': return a.aqi - b.aqi;
          case 'name': return a.cityName.localeCompare(b.cityName);
          case 'anomaly': return (b.hasAnomaly ? 1 : 0) - (a.hasAnomaly ? 1 : 0) || b.aqi - a.aqi;
          case 'trend': return a.trend.localeCompare(b.trend) || b.aqi - a.aqi;
          default: return b.aqi - a.aqi; // aqi_desc
        }
      });
  }, [cities, airQualityMap, forecasts, sortKey]);

  if (loadingForecasts && comparisons.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="skeleton w-56 h-5 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton w-full h-28 rounded-lg" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = comparisons.map(c => ({
    name: c.cityName,
    AQI: c.aqi,
    fill: c.aqiColor,
  }));

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'aqi_desc', label: 'Worst AQI' },
    { key: 'aqi_asc', label: 'Best AQI' },
    { key: 'anomaly', label: 'Most Anomalies' },
    { key: 'trend', label: 'Trend' },
    { key: 'name', label: 'City Name' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Multi-City Comparative Intelligence</h2>
          <p className="text-sm text-slate-500">Compare current conditions and simulated interventions across cities</p>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center flex-wrap gap-2">
        <ArrowUpDown size={14} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-500">Sort:</span>
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortKey === opt.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Comparison cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisons.map(c => (
          <div
            key={c.cityId}
            className={`bg-white rounded-xl border p-4 transition-all duration-150 hover:shadow-md ${
              c.hasAnomaly ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
            }`}
          >
            {/* City header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{c.cityName}</h3>
                <p className="text-[10px] text-slate-400">{c.cityState}</p>
              </div>
              {/* Trend indicator */}
              <div className="flex items-center gap-1" title={getTrendLabel(c.trend)}>
                {getTrendIcon(c.trend)}
                <span className="text-[10px] text-slate-500 font-medium">{getTrendLabel(c.trend)}</span>
              </div>
            </div>

            {/* AQI display */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold font-mono" style={{ color: c.aqiColor }}>
                {formatAQI(c.aqi)}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: c.aqiColor + '18', color: c.aqiColor }}
              >
                {c.aqiLabel}
              </span>
              {c.hasAnomaly && (
                <span className="text-[9px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                  Anomaly +{c.anomalyDeviation}%
                </span>
              )}
            </div>

            {/* Details row */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2 mt-1">
              <span>
                Source:{' '}
                <span className="font-medium" style={{ color: c.sourceColor }}>
                  {SOURCE_LABELS[c.dominantSource] || c.dominantSource}
                </span>
              </span>
              {c.forecastPeak && (
                <span>
                  Peak: <strong>{c.forecastPeak}</strong>
                </span>
              )}
              <span className="text-[9px] text-slate-400 italic">No simulation data</span>
            </div>

            {/* Baseline comparison bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                <span>Baseline: {c.baseAQI}</span>
                <span>Current: {c.aqi}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Baseline marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                  style={{ left: `${Math.min((c.baseAQI / 500) * 100, 100)}%` }}
                />
                {/* Current AQI bar */}
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((c.aqi / 500) * 100, 100)}%`,
                    backgroundColor: c.aqiColor,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">AQI Comparison Across Cities</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const city = comparisons.find(c => c.cityName === d.name);
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
                    <p className="font-semibold text-slate-900">{d.name}</p>
                    <p className="text-slate-600">AQI: <strong>{d.AQI}</strong> ({d.AQI <= 50 ? 'Good' : d.AQI <= 100 ? 'Satisfactory' : d.AQI <= 200 ? 'Moderate' : d.AQI <= 300 ? 'Poor' : d.AQI <= 400 ? 'Very Poor' : 'Severe'})</p>
                    {city && (
                      <>
                        <p className="text-slate-500">Trend: {getTrendLabel(city.trend)}</p>
                        <p className="text-slate-500">Source: {SOURCE_LABELS[city.dominantSource] || city.dominantSource}</p>
                        {city.hasAnomaly && <p className="text-red-500 font-medium">Anomaly active ({city.anomalyDeviation}% deviation)</p>}
                      </>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="AQI" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-slate-400 mt-3 text-center">
          Each bar shows current real-time AQI. Trend is derived by comparing current AQI against each city's seasonal baseline.
        </p>
      </div>
    </div>
  );
}
