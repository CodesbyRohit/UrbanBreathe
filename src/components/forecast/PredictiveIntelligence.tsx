import React from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart, ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useForecast } from '../../hooks/useForecast';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import { formatIndex, formatValue, formatCityTime } from '../../utils/provenance';
import { POLLUTANT_LABELS } from '../../utils/constants';
import MetricCard from '../common/MetricCard';
import DataBasisBadge from '../common/DataBasisBadge';

interface PredictiveIntelligenceProps {
  cityId: string;
}

export default function PredictiveIntelligence({ cityId }: PredictiveIntelligenceProps) {
  const { data, loading, error, refresh } = useForecast(cityId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="skeleton w-16 h-3 mb-2" />
              <div className="skeleton w-20 h-6" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="skeleton w-40 h-4 mb-4" />
          <div className="skeleton w-full h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error || 'Unable to load forecast data.'}</p>
          <p className="text-xs text-slate-500 mt-1">No substitute forecast is shown.</p>
          <button onClick={refresh} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const tz = data.season.timeZone;
  const chartData = data.points.map(p => ({
    label: `+${p.hoursAhead}h`,
    naqi: p.naqi,
    pm25: p.pm25,
    time: p.time,
    category: p.category,
    isLowerBound: p.naqiIsLowerBound,
  }));
  const tableRows = data.points.filter(p => p.hoursAhead % 6 === 0);
  const peak = data.peak;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">72-Hour Model Forecast</h2>
          <p className="text-sm text-slate-500">{data.model}, passed through unchanged</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DataBasisBadge provenance={data.provenance} referenceTime={data.issuedAt} timeZone={tz} />
          <button onClick={refresh} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Refresh forecast">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900" role="note">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{data.evaluationNote}</p>
          <p className="mt-0.5">{data.naqiNote} {data.naqiLabel}.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Highest NAQI estimate"
          value={peak ? formatIndex(peak.naqi, peak.naqiIsLowerBound) : '--'}
          color={getAQIColor(peak?.naqi ?? null)}
          subtitle={peak ? `${peak.category} · +${peak.hoursAhead}h` : 'Unavailable'}
        />
        <MetricCard
          label="Peak hour"
          value={peak ? formatCityTime(peak.time, tz) : '--'}
          subtitle={peak ? `Dominant: ${peak.dominantPollutants.map(p => POLLUTANT_LABELS[p] || p).join(', ')}` : undefined}
        />
        <MetricCard label="Horizon" value={`${data.horizonHours} h`} subtitle={`${data.points.length} hourly points`} />
        <MetricCard label="Season" value={data.season.label} subtitle="IMD convention" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">NAQI-method estimate over the next {data.horizonHours} hours</h3>
          <span className="text-[10px] text-slate-500">All points are model forecasts</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} interval={11} />
            <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} domain={[0, 'auto']} width={40} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-semibold text-slate-900">{formatCityTime(d.time, tz)} ({d.label})</p>
                    <p className="text-slate-600 mt-1">NAQI estimate: <strong>{formatIndex(d.naqi, d.isLowerBound)}</strong> ({getAQILabel(d.naqi)})</p>
                    <p className="text-slate-500">PM2.5 (hourly): {formatValue(d.pm25)} µg/m³</p>
                    <p className="text-[10px] text-slate-500 mt-1">Model forecast — not evaluated</p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={200} stroke="#9a3412" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Poor (201+)', fontSize: 10, fill: '#9a3412', position: 'right' }} />
            <ReferenceLine y={300} stroke="#7f1d1d" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Very Poor (301+)', fontSize: 10, fill: '#7f1d1d', position: 'right' }} />
            <Line type="monotone" dataKey="naqi" stroke="#c2410c" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Forecast details (every 6 hours)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium">Time (IST)</th>
                <th className="text-left px-4 py-3 font-medium">NAQI est.</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">PM2.5 (hourly)</th>
                <th className="text-left px-4 py-3 font-medium">Dominant</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(p => {
                const color = getAQIColor(p.naqi);
                return (
                  <tr key={p.time} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {formatCityTime(p.time, tz)} <span className="ml-1 text-[10px] text-slate-500 font-normal">+{p.hoursAhead}h</span>
                    </td>
                    <td className="px-4 py-3"><span className="font-semibold font-mono" style={{ color }}>{formatIndex(p.naqi, p.naqiIsLowerBound)}</span></td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: color + '15', color }}>
                        {p.category ?? 'Insufficient data'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono">{formatValue(p.pm25)} µg/m³</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.dominantPollutants.map(d => POLLUTANT_LABELS[d] || d).join(', ') || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
