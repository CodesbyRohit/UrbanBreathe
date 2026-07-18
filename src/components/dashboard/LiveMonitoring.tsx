import React, { useRef } from 'react';
import { Wind, Thermometer, Droplets, Eye, Gauge, Compass } from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from 'recharts';
import AQIGauge from './AQIGauge';
import PollutantCard from './PollutantCard';
import MetricCard from '../common/MetricCard';
import type { City, AirQualityData } from '../../types';
import { POLLUTANTS } from '../../utils/constants';
import { getAQIColor, getAQILabel, formatAQI } from '../../utils/formatters';

interface LiveMonitoringProps {
  city: City | null;
  airQuality: AirQualityData | null;
  loading: boolean;
}

const mockTimeline = [
  { time: '00:00', aqi: 145, pm25: 62 }, { time: '04:00', aqi: 152, pm25: 68 },
  { time: '08:00', aqi: 178, pm25: 82 }, { time: '12:00', aqi: 198, pm25: 92 },
  { time: '16:00', aqi: 185, pm25: 85 }, { time: '20:00', aqi: 165, pm25: 75 },
  { time: 'Now', aqi: 160, pm25: 72 },
];

export default function LiveMonitoring({ city, airQuality, loading }: LiveMonitoringProps) {
  const prevAqiRef = useRef<number | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center h-80">
          <div className="skeleton w-32 h-8 rounded-full mb-4" />
          <div className="skeleton w-32 h-32 rounded-full" />
          <div className="skeleton w-24 h-4 mt-4" />
          <div className="skeleton w-36 h-3 mt-2" />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="skeleton w-14 h-3 mb-3" />
              <div className="skeleton w-10 h-6 mb-2" />
              <div className="skeleton w-16 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!airQuality || !city) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">Unable to load air quality data.</p>
          <p className="text-xs text-slate-400 mt-1">Please select a city and try again.</p>
        </div>
      </div>
    );
  }

  const aqiColor = getAQIColor(airQuality.aqi);
  const aqiLabel = getAQILabel(airQuality.aqi);

  // Store current AQI for next comparison
  // Always update ref so city/data changes animate from current value
  if (prevAqiRef.current === null) prevAqiRef.current = airQuality.aqi;
  const prevAqiSnapshot = prevAqiRef.current;
  prevAqiRef.current = airQuality.aqi;

  return (
    <div className="space-y-6">
      {/* AQI Overview — tighter hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center">
          <div className="relative">
            <AQIGauge
              aqi={airQuality.aqi}
              label={aqiLabel}
              color={aqiColor}
              prevAqi={prevAqiSnapshot}
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-400">Data source: {airQuality.dataSource || 'Open-Meteo / Fallback'}</span>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Temperature" value={Math.round(airQuality.temperature)} unit="°C" icon={<Thermometer size={16} />} />
          <MetricCard label="Humidity" value={Math.round(airQuality.humidity)} unit="%" icon={<Droplets size={16} />} />
          <MetricCard label="Wind Speed" value={Math.round(airQuality.windSpeed * 10) / 10} unit="km/h" icon={<Wind size={16} />} subtitle={airQuality.windDirection} />
          <MetricCard label="Visibility" value={airQuality.visibility?.toFixed(1) || '--'} unit="km" icon={<Eye size={16} />} />
          <MetricCard label="Pressure" value={Math.round(airQuality.pressure)} unit="hPa" icon={<Gauge size={16} />} />
          <MetricCard label="Wind Dir" value={airQuality.windDirection || '--'} icon={<Compass size={16} />} subtitle="Direction" />
          <MetricCard label="PM2.5 / PM10" value={`${Math.round(airQuality.pm25)} / ${Math.round(airQuality.pm10)}`} unit="µg/m³" trend={airQuality.pm25 > 60 ? 'up' : 'down'} />
          <MetricCard label="Overall AQI" value={formatAQI(airQuality.aqi)} color={aqiColor} trend={airQuality.aqi > 200 ? 'up' : airQuality.aqi > 100 ? 'stable' : 'down'} />
        </div>
      </div>

      {/* Pollutants Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Pollutant Concentrations</h3>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">All values in µg/m³ or ppb</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POLLUTANTS.map(p => (
            <PollutantCard key={p.key} pollutant={p} data={airQuality} />
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Today's AQI Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockTimeline}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={aqiColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={aqiColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="aqi" stroke={aqiColor} strokeWidth={2} fill="url(#aqiGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Health & City Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">City Health Metrics</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-500">Population</span>
              <span className="font-medium text-slate-800 font-mono">{city.population}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-500">Area</span>
              <span className="font-medium text-slate-800 font-mono">{city.area}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-500">Dominant Pollutant</span>
              <span className="font-medium text-slate-800">{city.dominant}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">AQI Status</span>
              <span className="font-medium font-mono" style={{ color: aqiColor }}>{aqiLabel}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Environmental Intelligence</h3>
          <div className="space-y-2">
            {airQuality.aqi > 200 && (
              <div className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                High pollution — consider issuing health advisory
              </div>
            )}
            {airQuality.windSpeed < 5 && (
              <div className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                Low wind — pollution may accumulate
              </div>
            )}
            {airQuality.humidity > 70 && (
              <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                High humidity — secondary particle formation likely
              </div>
            )}
            {airQuality.aqi <= 100 && (
              <div className="px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-teal-100">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                Air quality is acceptable — continue monitoring
              </div>
            )}
            {airQuality.aqi > 100 && airQuality.aqi <= 200 && (
              <div className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-2 border border-yellow-100">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                Moderate — sensitive groups should limit outdoor activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
