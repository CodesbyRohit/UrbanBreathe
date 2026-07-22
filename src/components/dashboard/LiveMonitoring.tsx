import React, { useRef } from 'react';
import { Wind, Thermometer, Droplets, Eye, Gauge, Compass, AlertTriangle } from 'lucide-react';
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

const sampleTimeline = [
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
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
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
          <p className="text-xs text-slate-500 mt-1">Please select a city and try again.</p>
        </div>
      </div>
    );
  }

  const aqiColor = getAQIColor(airQuality.aqi);
  const aqiLabel = getAQILabel(airQuality.aqi);

  if (prevAqiRef.current === null) prevAqiRef.current = airQuality.aqi;
  const prevAqiSnapshot = prevAqiRef.current;
  prevAqiRef.current = airQuality.aqi;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AQI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center card-hover">
          <div className="relative">
            <AQIGauge
              aqi={airQuality.aqi}
              label={aqiLabel}
              color={aqiColor}
              prevAqi={prevAqiSnapshot}
            />
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            {airQuality.anomaly?.isAnomaly && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full animate-fade-in" role="alert">
                <AlertTriangle size={12} className="text-red-600 shrink-0" />
                <span className="text-[11px] font-semibold text-red-700">
                  Anomaly: {airQuality.anomaly.deviationPercent}% {airQuality.anomaly.direction === 'above' ? 'above' : 'below'} expected
                </span>
              </div>
            )}
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${airQuality.dataSource === 'fallback' ? 'bg-amber-500' : 'bg-teal-500'}`} />
              <span className={airQuality.dataSource === 'fallback' ? 'text-amber-600 font-medium' : 'text-slate-500'}>
                {airQuality.dataSource === 'fallback' ? 'Using fallback data — API unavailable' : 'Open-Meteo (Live)'}
              </span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {/* Weather cards */}
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Weather
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard key="temp" label="Temperature" value={Math.round(airQuality.temperature)} unit="°C" icon={<Thermometer size={16} />} />
            <MetricCard key="hum" label="Humidity" value={Math.round(airQuality.humidity)} unit="%" icon={<Droplets size={16} />} />
            <MetricCard key="wind" label="Wind Speed" value={Math.round(airQuality.windSpeed * 10) / 10} unit="km/h" icon={<Wind size={16} />} subtitle={airQuality.windDirection} />
            <MetricCard key="vis" label="Visibility" value={airQuality.visibility?.toFixed(1) || '--'} unit="km" icon={<Eye size={16} />} />
          </div>

          {/* Air Quality cards */}
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Air Quality
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard key="press" label="Pressure" value={Math.round(airQuality.pressure)} unit="hPa" icon={<Gauge size={16} />} />
            <MetricCard key="wdir" label="Wind Dir" value={airQuality.windDirection || '--'} icon={<Compass size={16} />} subtitle="Direction" />
            <MetricCard key="pm" label="PM2.5 / PM10" value={`${Math.round(airQuality.pm25)} / ${Math.round(airQuality.pm10)}`} unit="µg/m³" trend={airQuality.pm25 > 60 ? 'up' : 'down'} />
            <MetricCard key="aqi" label="Overall AQI" value={formatAQI(airQuality.aqi)} color={aqiColor} trend={airQuality.aqi > 200 ? 'up' : airQuality.aqi > 100 ? 'stable' : 'down'} />
          </div>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Pollutant Concentrations</h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">All values in µg/m³ or ppb</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POLLUTANTS.map((p) => (
            <PollutantCard key={p.key} pollutant={p} data={airQuality} />
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Today's AQI Trend</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Peak: <span className="font-bold font-mono" style={{ color: aqiColor }}>198</span>
            <span className="text-slate-500 mx-1">·</span>
            Now: <span className="font-bold font-mono" style={{ color: aqiColor }}>{airQuality.aqi}</span>
            <span className="text-slate-500 ml-1">{airQuality.aqi < 200 ? '↓ Improving' : '↑ Elevated'}</span>
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sampleTimeline}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={aqiColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={aqiColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="aqi" stroke={aqiColor} strokeWidth={2} fill="url(#aqiGradient)" dot={{ r: 3, fill: aqiColor, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
