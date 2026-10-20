import React from 'react';
import { RefreshCw, Sun, Moon, PlayCircle, Menu } from 'lucide-react';
import type { City, AirQualityData } from '../../types';
import { formatIndex, formatCityTime } from '../../utils/provenance';
import { useAqiColor } from '../../hooks/useTheme';
import CitySelector from '../common/CitySelector';
import CategoryBadge from '../common/CategoryBadge';
import DataBasisBadge from '../common/DataBasisBadge';

interface HeaderProps {
  cities: City[];
  selectedCityId: string;
  onSelectCity: (id: string) => void;
  airQuality: AirQualityData | null;
  loading: boolean;
  onRefresh: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  onStartIntro?: () => void;
}

/** City context shared by every view: which city, its current estimate, and when it is for. */
export default function Header({
  cities, selectedCityId, onSelectCity, airQuality, loading, onRefresh, theme, onToggleTheme, onOpenMenu, onStartIntro,
}: HeaderProps) {
  const aqiColor = useAqiColor();
  const city = cities.find(c => c.id === selectedCityId);

  return (
    <header className="no-print bg-white border-b border-slate-200 px-3 md:px-6 py-2.5 flex items-center gap-2 md:gap-4 flex-wrap">
      <button
        type="button"
        onClick={onOpenMenu}
        className="md:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg"
        aria-label="Open navigation menu"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <CitySelector cities={cities} selectedId={selectedCityId} onSelect={onSelectCity} />

      {airQuality && airQuality.cityId === selectedCityId && (
        <div className="flex items-center gap-2 md:gap-3 min-w-0" role="group" aria-label={`${city?.name ?? ''} current NAQI-method estimate`}>
          <span className="text-xl font-bold leading-none tabular" style={{ color: aqiColor(airQuality.aqi) }}>
            {formatIndex(airQuality.aqi, airQuality.aqiIsLowerBound)}
          </span>
          <CategoryBadge index={airQuality.aqi} label={airQuality.aqiCategory} />
          <span className="hidden sm:inline text-xs text-slate-500 whitespace-nowrap" title={airQuality.naqi.label}>
            NAQI est. · {formatCityTime(airQuality.referenceTime, city?.timezone)}
          </span>
          <DataBasisBadge provenance={airQuality.provenance} className="hidden xl:inline-flex" />
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {onStartIntro && (
          <button
            type="button"
            onClick={onStartIntro}
            className="hidden lg:inline-flex btn text-slate-600 hover:bg-slate-100"
            aria-label="Play optional presentation intro"
          >
            <PlayCircle size={14} aria-hidden="true" /> Intro
          </button>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary"
          aria-label="Reload air-quality data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          <span className="hidden sm:inline">{loading ? 'Loading…' : 'Reload'}</span>
        </button>
      </div>
    </header>
  );
}
