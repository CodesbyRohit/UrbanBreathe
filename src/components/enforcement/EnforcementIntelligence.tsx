import React, { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, Info, RefreshCw, Target } from 'lucide-react';
import type { City, AirQualityData, SourceAttribution } from '../../types';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import { getSources } from '../../services/api';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../utils/constants';

interface EnforcementIntelligenceProps {
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
}

interface PriorityEntry {
  cityId: string;
  cityName: string;
  cityState: string;
  aqi: number;
  aqiLabel: string;
  aqiScore: number;
  anomalyActive: boolean;
  anomalyDeviation: number;
  anomalyScore: number;
  dominantSource: string;
  sourceConfidence: number;
  sourceScore: number;
  priorityScore: number;
  primaryReason: string;
}

/**
 * Transparent, rule-based prioritization engine.
 *
 * Priority Score = (AQI Severity × 40%) + (Anomaly Flag × 35%) + (Source Confidence × 25%)
 *
 * - AQI Severity: normalized 0–100 (AQI / 5, capped at 100)
 * - Anomaly Flag: 100 if anomaly detected, 0 otherwise
 * - Source Confidence: from source attribution dominant source (0–100)
 */
function computePriorityScore(aqi: number, isAnomaly: boolean, sourceConfidence: number): number {
  const aqiScore = Math.min(aqi / 5, 100);
  const anomalyScore = isAnomaly ? 100 : 0;
  const sourceScore = sourceConfidence;

  const score = aqiScore * 0.40 + anomalyScore * 0.35 + sourceScore * 0.25;
  return Math.round(score);
}

export default function EnforcementIntelligence({ cities, airQualityMap }: EnforcementIntelligenceProps) {
  const [sourceData, setSourceData] = useState<Record<string, SourceAttribution | null>>({});
  const [loadingSources, setLoadingSources] = useState(true);
  const [sortBy, setSortBy] = useState<'priority' | 'aqi' | 'name'>('priority');
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoadingSources(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        cities.map(c => getSources(c.id).then(d => ({ id: c.id, data: d })))
      );
      const map: Record<string, SourceAttribution | null> = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value.data;
      });
      setSourceData(map);
    } catch {
      setError('Could not load source attribution data for some cities.');
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    if (cities.length > 0) fetchSources();
  }, [cities]);

  const entries = useMemo((): PriorityEntry[] => {
    return cities
      .map(city => {
        const aqData = airQualityMap[city.id];
        const aqi = aqData?.aqi ?? city.baseAQI ?? 150;
        const anomaly = aqData?.anomaly;
        const isAnomaly = anomaly?.isAnomaly ?? false;
        const anomalyDeviation = anomaly?.deviationPercent ?? 0;

        // Get source attribution data
        const sources = sourceData[city.id];
        const dominantSource = sources?.sortedSources?.[0];
        const sourceName = dominantSource?.source || city.dominant || 'unknown';
        const sourceConfidence = dominantSource?.confidence ?? 50;

        const aqiScore = Math.min(aqi / 5, 100);
        const anomalyScore = isAnomaly ? 100 : 0;
        const sourceScore = sourceConfidence;
        const priorityScore = computePriorityScore(aqi, isAnomaly, sourceConfidence);

        // Determine primary reason for the score
        let primaryReason = '';
        if (isAnomaly && anomalyDeviation > 0) {
          primaryReason = `Anomaly detected — ${anomalyDeviation}% above expected, dominant source: ${SOURCE_LABELS[sourceName] || sourceName}, ${sourceConfidence}% confidence`;
        } else if (aqi > 300) {
          primaryReason = `Critical AQI (${aqi}) — ${getAQILabel(aqi)}, dominant source: ${SOURCE_LABELS[sourceName] || sourceName}`;
        } else if (aqi > 200) {
          primaryReason = `Elevated AQI (${aqi}) — ${getAQILabel(aqi)}, dominant source: ${SOURCE_LABELS[sourceName] || sourceName}`;
        } else {
          primaryReason = `Routine monitoring — AQI ${aqi} (${getAQILabel(aqi)}), dominant source: ${SOURCE_LABELS[sourceName] || sourceName}`;
        }

        return {
          cityId: city.id,
          cityName: city.name,
          cityState: city.state,
          aqi,
          aqiLabel: getAQILabel(aqi),
          aqiScore,
          anomalyActive: isAnomaly,
          anomalyDeviation,
          anomalyScore,
          dominantSource: sourceName,
          sourceConfidence,
          sourceScore,
          priorityScore,
          primaryReason,
        };
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'aqi': return b.aqi - a.aqi;
          case 'name': return a.cityName.localeCompare(b.cityName);
          default: return b.priorityScore - a.priorityScore;
        }
      });
  }, [cities, airQualityMap, sourceData, sortBy]);

  const getScoreSeverity = (score: number) => {
    if (score >= 70) return { label: 'Critical', color: '#b91c1c', bg: '#fee2e2' };
    if (score >= 50) return { label: 'High', color: '#c2410c', bg: '#ffedd5' };
    if (score >= 30) return { label: 'Moderate', color: '#a16207', bg: '#fef9c3' };
    return { label: 'Low', color: '#15803d', bg: '#dcfce7' };
  };

  if (loadingSources && entries.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="skeleton w-56 h-5 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton w-full h-16 rounded-lg" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={fetchSources} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Shield size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Enforcement Intelligence</h2>
          <p className="text-sm text-slate-500">Transparent, rule-based prioritization for inspection and intervention</p>
        </div>
      </div>

      {/* Formula tooltip card */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-brand-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-800">How the Priority Score is Calculated</p>
            <p className="text-xs text-brand-700 mt-1 leading-relaxed">
              <strong>Priority Score = (AQI Severity × 40%) + (Anomaly Flag × 35%) + (Source Confidence × 25%)</strong>
            </p>
            <ul className="text-xs text-brand-600 mt-1.5 space-y-0.5">
              <li>• <strong>AQI Severity</strong>: Current AQI normalized to 0–100 (AQI ÷ 5, capped at 100) — higher values indicate worse air quality</li>
              <li>• <strong>Anomaly Flag</strong>: 100 if an anomaly is&nbsp;detected (current reading deviates &gt;40% from expected), 0 otherwise</li>
              <li>• <strong>Source Confidence</strong>: Confidence score (0–100) of the dominant pollution source from source attribution analysis</li>
            </ul>
            <p className="text-xs text-brand-500 mt-1.5">This is a transparent, deterministic formula — not a black-box AI model. All inputs are computed from live sensor data.</p>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Sort by:</span>
        {([
          { key: 'priority' as const, label: 'Priority Score' },
          { key: 'aqi' as const, label: 'AQI (worst first)' },
          { key: 'name' as const, label: 'City Name' },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
              sortBy === opt.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Priority list */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const severity = getScoreSeverity(entry.priorityScore);
          const aqiColor = getAQIColor(entry.aqi);

          return (
            <div
              key={entry.cityId}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow duration-150"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-slate-500">#{index + 1}</span>
                </div>

                {/* City info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">{entry.cityName}</h3>
                    <span className="text-[10px] text-slate-400">{entry.cityState}</span>
                    {/* Priority score badge */}
                    <span
                      className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                      style={{ backgroundColor: severity.bg, color: severity.color }}
                    >
                      Score: {entry.priorityScore} — {severity.label}
                    </span>
                  </div>

                  {/* Primary reason */}
                  <div className="flex items-start gap-1.5 mt-1">
                    {entry.anomalyActive ? (
                      <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{entry.primaryReason}</p>
                  </div>

                  {/* Score breakdown bar */}
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      AQI: <strong style={{ color: aqiColor }}>{entry.aqi}</strong>
                      <span className="text-slate-400">({entry.aqiLabel}, {Math.round(entry.aqiScore)}pts)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Anomaly:{' '}
                      <strong className={entry.anomalyActive ? 'text-red-500' : 'text-slate-400'}>
                        {entry.anomalyActive ? `Yes (${entry.anomalyDeviation}% dev.)` : 'No'}
                      </strong>
                      <span className="text-slate-400">({Math.round(entry.anomalyScore)}pts)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Source: <strong style={{ color: SOURCE_COLORS[entry.dominantSource] || '#64748b' }}>{entry.sourceConfidence}%</strong>
                      <span className="text-slate-400">({Math.round(entry.sourceScore)}pts)</span>
                    </span>
                  </div>

                  {/* Visual score bar */}
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(entry.priorityScore, 100)}%`,
                        backgroundColor: severity.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-700">Priority Thresholds</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
          {[
            { label: 'Critical (70+)', color: '#b91c1c', bg: '#fee2e2', desc: 'Requires immediate inspection' },
            { label: 'High (50–69)', color: '#c2410c', bg: '#ffedd5', desc: 'Schedule intervention within 48 hours' },
            { label: 'Moderate (30–49)', color: '#a16207', bg: '#fef9c3', desc: 'Monitor and prepare response plan' },
            { label: 'Low (0–29)', color: '#15803d', bg: '#dcfce7', desc: 'Routine monitoring' },
          ].map(t => (
            <div key={t.label} className="p-2 rounded-lg border border-slate-100" style={{ backgroundColor: t.bg }}>
              <span className="font-semibold block" style={{ color: t.color }}>{t.label}</span>
              <span className="text-slate-500">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
