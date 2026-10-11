import React, { useRef } from 'react';
import { Wind, Thermometer, Droplets, Eye, Gauge, Compass, Info } from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from 'recharts';
import AQIGauge from './AQIGauge';
import PollutantCard from './PollutantCard';
import MetricCard from '../common/MetricCard';
import DataBasisBadge from '../common/DataBasisBadge';
import type { City, AirQualityData } from '../../types';
import { POLLUTANTS, POLLUTANT_LABELS } from '../../utils/constants';
import { getAQIColor, getAQILabel } from '../../utils/formatters';
import { formatValue, formatCityTime } from '../../utils/provenance';

interface LiveMonitoringProps {
  city: City | null;
  airQuality: AirQualityData | null;
  loading: boolean;
  error?: string | null;
}

export default function LiveMonitoring({ city, airQuality, loading, error }: LiveMonitoringProps) {
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
        <div className="text-center max-w-md">
          <p className="text-sm text-slate-600 font-medium">Air-quality data is unavailable.</p>
          <p className="text-xs text-slate-500 mt-1">{error || 'Please select a city and try again.'}</p>
          <p className="text-xs text-slate-500 mt-1">No substitute values are shown.</p>
        </div>
      </div>
    );
  }

  const aqiColor = getAQIColor(airQuality.aqi);
  const aqiLabel = getAQILabel(airQuality.aqi);
  const tz = city.timezone;

  const prevAqiSnapshot = prevAqiRef.current;
  prevAqiRef.current = airQuality.aqi;

  const history = airQuality.history.map(p => ({
    time: formatCityTime(p.time, tz).replace(/^\d+ \w+, /, ''),
    pm25: p.pm25,
    pm10: p.pm10,
  }));
  const dominant = airQuality.naqi.dominantPollutants.map(p => POLLUTANT_LABELS[p] || p).join(', ');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* NAQI estimate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center card-hover">
          <AQIGauge
            aqi={airQuality.aqi}
            isLowerBound={airQuality.aqiIsLowerBound}
            label={aqiLabel}
            color={aqiColor}
            prevAqi={prevAqiSnapshot}
          />
          <div className="mt-3 flex flex-col items-center gap-2 text-center">
            <DataBasisBadge provenance={airQuality.provenance} referenceTime={airQuality.referenceTime} timeZone={tz} />
            {airQuality.aqiStatus === 'ok' ? (
              <p className="text-[11px] text-slate-500">Dominant pollutant: <strong>{dominant}</strong></p>
            ) : (
              <p className="text-[11px] text-amber-700" role="status">
                Not enough valid data for a NAQI estimate. {airQuality.naqi.reasons.join(' ')}
              </p>
            )}
            <p className="text-[10px] text-slate-500 max-w-[16rem] leading-snug">{airQuality.naqi.label}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Weather (modelled)
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Temperature" value={formatValue(airQuality.temperature)} unit="°C" icon={<Thermometer size={16} />} />
            <MetricCard label="Humidity" value={formatValue(airQuality.humidity)} unit="%" icon={<Droplets size={16} />} />
            <MetricCard label="Wind Speed" value={formatValue(airQuality.windSpeed, 1)} unit="km/h" icon={<Wind size={16} />} subtitle={airQuality.windDirection ?? undefined} />
            <MetricCard label="Visibility" value={formatValue(airQuality.visibility, 1)} unit="km" icon={<Eye size={16} />} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Pressure" value={formatValue(airQuality.pressure)} unit="hPa" icon={<Gauge size={16} />} />
            <MetricCard label="Wind Dir" value={airQuality.windDirection ?? '--'} icon={<Compass size={16} />} subtitle="Direction" />
            <MetricCard label="PM2.5 / PM10" value={`${formatValue(airQuality.pm25)} / ${formatValue(airQuality.pm10)}`} unit="µg/m³" subtitle="Hourly" />
            <MetricCard label="Category" value={airQuality.aqiCategory ?? '--'} color={aqiColor} subtitle="NAQI estimate" />
          </div>
          {'status' in airQuality.provenance.weather && (
            <p className="text-[11px] text-amber-700">Weather data unavailable: {airQuality.provenance.weather.reason}</p>
          )}
        </div>
      </div>

      {/* Pollutants Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Pollutant Concentrations</h2>
          <span className="text-[10px] text-slate-500">All values µg/m³ · modelled · sub-index from 24-h (8-h for O₃/CO) means</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POLLUTANTS.map((p) => (
            <PollutantCard key={p.key} pollutant={p} data={airQuality} />
          ))}
        </div>
      </div>

      {/* Last 24 hours of modelled PM */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-700">Last 24 hours — modelled PM2.5 and PM10</h2>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={12} /> Hourly CAMS model values for {city.name}, not station measurements
          </span>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">No hourly values available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} interval={3} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={40} unit="" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(v, name) => [v == null ? '--' : `${v} µg/m³`, name === 'pm25' ? 'PM2.5' : 'PM10']}
              />
              <Area type="monotone" dataKey="pm10" stroke="#a16207" strokeWidth={1.5} fill="none" connectNulls={false} />
              <Area type="monotone" dataKey="pm25" stroke="#2675dc" strokeWidth={2} fill="none" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
