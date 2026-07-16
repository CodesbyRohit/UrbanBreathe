import React from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';
import { useForecast } from '../../hooks/useForecast';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import MetricCard from '../common/MetricCard';

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
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
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
          <button onClick={refresh} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = data.forecast.map(f => ({
    time: f.hour,
    aqi: f.aqi,
    pm25: f.pm25,
    confidence: f.confidence,
  }));

  const trendIcon = data.trend === 'Improving' ? <ArrowDown size={14} /> :
    data.trend === 'Deteriorating' ? <ArrowUp size={14} className="text-red-500" /> :
    <Minus size={14} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">72-Hour Predictive Intelligence</h2>
          <p className="text-sm text-slate-500">AI-powered air quality forecasting with confidence scoring</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{data.season} season</span>
          <button onClick={refresh} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Peak AQI" value={data.peak.aqi} color={getAQIColor(data.peak.aqi)} subtitle={`at ${data.peak.hour}`} />
        <MetricCard label="Trend" value={data.trend} icon={trendIcon} subtitle="72-hour outlook" />
        <MetricCard label="Avg Confidence" value={`${data.confidence}%`} subtitle="Model reliability" />
        <MetricCard label="Season" value={data.season.charAt(0).toUpperCase() + data.season.slice(1)} subtitle="Current season" />
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">AQI Forecast (72 hours)</h3>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" /> AQI</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Poor threshold</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b91e8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b91e8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} width={40} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-semibold text-slate-900">{label}</p>
                    <p className="text-slate-600 mt-1">AQI: <strong>{d.aqi}</strong> ({getAQILabel(d.aqi)})</p>
                    <p className="text-slate-500">PM2.5: {d.pm25} µg/m³</p>
                    <p className="text-slate-400">Confidence: {d.confidence}%</p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={200} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Poor', fontSize: 10, fill: '#f97316', position: 'right' }} />
            <ReferenceLine y={300} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Very Poor', fontSize: 10, fill: '#ef4444', position: 'right' }} />
            <Area type="monotone" dataKey="aqi" stroke="#3b91e8" strokeWidth={2} fill="url(#forecastGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Hourly Forecast Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                <th className="text-left px-5 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">AQI</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">PM2.5</th>
                <th className="text-left px-4 py-3 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 font-medium">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {data.forecast.map((f, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{f.hour}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: f.color }}>{f.aqi}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: f.color + '15', color: f.color }}>
                      {f.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{f.pm25} µg/m³</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${f.confidence}%`, backgroundColor: f.confidence > 70 ? '#16a34a' : f.confidence > 50 ? '#eab308' : '#ef4444' }} />
                      </div>
                      <span className="text-xs text-slate-500">{f.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {f.alerts?.length > 0 ? (
                      <div className="flex items-center gap-1 text-red-600 text-[11px]">
                        <AlertTriangle size={12} />
                        <span>{f.alerts[0]}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
