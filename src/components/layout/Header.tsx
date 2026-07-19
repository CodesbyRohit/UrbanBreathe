import React from 'react';
import { RefreshCw, Clock, Sun, Moon } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { formatAQI, getAQIColor, getAQIColorLight, getAQILabel, timeAgo } from '../../utils/formatters';

interface HeaderProps {
  city: City | null;
  airQuality: AirQualityData | null;
  loading: boolean;
  onRefresh: () => void;
  lastUpdated: string | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Header({ city, airQuality, loading, onRefresh, lastUpdated, theme, onToggleTheme }: HeaderProps) {
  const effectiveAqiColor = airQuality
    ? (theme === 'dark' ? getAQIColorLight(airQuality.aqi) : getAQIColor(airQuality.aqi))
    : undefined;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {city && (
          <>
            <div>
              <h1 className="text-base font-semibold text-slate-900">{city.name}</h1>
              <p className="text-xs text-slate-500">{city.state} • Pop: {city.population}</p>
            </div>
            {airQuality && effectiveAqiColor && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold leading-none"
                      style={{ color: effectiveAqiColor }}
                    >
                      {formatAQI(airQuality.aqi)}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      AQI
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{
                      backgroundColor: effectiveAqiColor + '15',
                      color: effectiveAqiColor,
                    }}
                  >
                    {getAQILabel(airQuality.aqi)}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {lastUpdated && (
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock size={12} />
            {timeAgo(lastUpdated)}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Refresh air quality data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>
    </header>
  );
}
