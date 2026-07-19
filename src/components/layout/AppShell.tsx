import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CitySelector from '../common/CitySelector';
import IndiaMap from '../common/IndiaMap';
import BootSequence from './BootSequence';
import InitGate from './InitGate';
import CompactLanding from '../landing/CompactLanding';
import ImpactSection from '../landing/ImpactSection';
import { Menu, Loader } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { useCities, useAirQuality } from '../../hooks/useCityData';
import { useTheme } from '../../hooks/useTheme';
import { getAirQuality } from '../../services/api';
import type { AirQualityData } from '../../types';

// Lazy-loaded modules for code-splitting
const LiveMonitoring = lazy(() => import('../dashboard/LiveMonitoring'));
const SourceAttribution = lazy(() => import('../source-attribution/SourceAttribution'));
const PredictiveIntelligence = lazy(() => import('../forecast/PredictiveIntelligence'));
const PolicySimulator = lazy(() => import('../simulator/PolicySimulator'));
const EnforcementIntelligence = lazy(() => import('../enforcement/EnforcementIntelligence'));
const ComparativeIntelligence = lazy(() => import('../comparative/ComparativeIntelligence'));
const ExecutiveBrief = lazy(() => import('../executive-brief/ExecutiveBrief'));
const CitizenAdvisory = lazy(() => import('../citizen-advisory/CitizenAdvisory'));

function ModuleFallback() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader size={16} className="animate-spin" />
        Loading module...
      </div>
    </div>
  );
}

export default function AppShell() {
  const { cities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showInitGate, setShowInitGate] = useState(() => !sessionStorage.getItem('urbanbreathe_boot_played'));
  const [showBoot, setShowBoot] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const lastUpdatedRef = useRef<string | null>(null);
  const { theme, toggleTheme, isDark } = useTheme();

  const selectedCity = cities.find(c => c.id === selectedCityId) || null;
  const { data: airQuality, loading: aqLoading, refresh: refreshAQ } = useAirQuality(selectedCity);

  // Track all air quality data for map and snapshot views
  const [airQualityMap, setAirQualityMap] = useState<Record<string, AirQualityData | null>>({});

  useEffect(() => {
    if (airQuality && selectedCity) {
      setAirQualityMap(prev => ({ ...prev, [selectedCity.id]: airQuality }));
      lastUpdatedRef.current = new Date().toISOString();
      setInitialLoading(false);
    }
    if (cities.length > 0 && selectedCity && !airQuality && !aqLoading) {
      const timer = setTimeout(() => setInitialLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [airQuality, cities, selectedCity, aqLoading]);

  // Fetch air quality for all cities on mount (approximate for snapshot)
  useEffect(() => {
    if (cities.length === 0) return;
    const fetchAll = async () => {
      /* getAirQuality imported statically at top of file */
      const results = await Promise.allSettled(
        cities.map(c => getAirQuality(c.id, c.lat, c.lon).then(d => ({ id: c.id, data: d })))
      );
      const map: Record<string, AirQualityData | null> = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          map[r.value.id] = r.value.data;
        }
      });
      setAirQualityMap(prev => ({ ...prev, ...map }));
    };
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length > 0]);

  const handleRefresh = useCallback(() => {
    refreshAQ();
    lastUpdatedRef.current = new Date().toISOString();
  }, [refreshAQ]);

  const handleCitySelect = useCallback((id: string) => {
    setSelectedCityId(id);
    // Keep dashboard active when selecting from map
  }, []);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    setShowLanding(false);
    setShowBoot(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // Compute snapshot stats from real air quality data
  const worstCity = (() => {
    let worst: { name: string; aqi: number } | null = null;
    Object.entries(airQualityMap).forEach(([id, data]) => {
      if (data?.aqi && (!worst || data.aqi > worst.aqi)) {
        const city = cities.find(c => c.id === id);
        worst = { name: city?.name || id, aqi: data.aqi };
      }
    });
    return worst;
  })();

  const activeAnomalies = Object.values(airQualityMap).filter(
    d => d?.anomaly?.isAnomaly
  ).length;

  const anomalyMap: Record<string, boolean> = {};
  Object.entries(airQualityMap).forEach(([id, data]) => {
    anomalyMap[id] = data?.anomaly?.isAnomaly ?? false;
  });

  // InitGate → BootSequence → CompactLanding → Dashboard
  if (showInitGate) {
    return <InitGate onTap={() => { setShowInitGate(false); setShowBoot(true); }} />;
  }

  if (showBoot) {
    return <BootSequence onComplete={() => setShowBoot(false)} />;
  }

  // Compact landing view — merges hero + stats + map + impact into one view
  if (showLanding) {
    return (
      <CompactLanding
        cities={cities}
        selectedCityId={selectedCityId}
        airQualityMap={airQualityMap}
        anomalyMap={anomalyMap}
        worstCity={worstCity}
        activeAnomalies={activeAnomalies}
        onSelectCity={handleCitySelect}
        onEnterDashboard={() => { setShowLanding(false); }}
        onNavigate={handleNavigate}
      />
    );
  }

  // Show initial skeleton only on first page load
  if (initialLoading && !airQuality && cities.length === 0) {
    return <InitialLoadingSkeleton />;
  }

  const renderSection = () => {
    const section = (() => {
      switch (activeSection) {
        case 'dashboard': return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
        case 'sources': return <SourceAttribution cityId={selectedCityId} />;
        case 'forecast': return <PredictiveIntelligence cityId={selectedCityId} />;
        case 'simulator': return <PolicySimulator cityId={selectedCityId} />;
        case 'enforcement': return <EnforcementIntelligence cities={cities} airQualityMap={airQualityMap} />;
        case 'comparative': return <ComparativeIntelligence cities={cities} airQualityMap={airQualityMap} />;
        case 'brief': return <ExecutiveBrief cityId={selectedCityId} />;
        case 'advisory': return <CitizenAdvisory cityId={selectedCityId} />;
        default: return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
      }
    })();
    return <Suspense fallback={<ModuleFallback />}>{section}</Suspense>;
  };

  // Dashboard/command centre view
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Skip-to-content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Sidebar activeSection={activeSection} onSectionChange={handleNavigate} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: mobile hamburger + Header */}
        <div className="bg-white px-4 md:px-6 py-3 flex items-center gap-3 border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Header
            city={selectedCity}
            airQuality={airQuality}
            loading={aqLoading}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdatedRef.current}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>

        <main id="main-content" className="flex-1 overflow-auto">
          {/* City selector + India Map row */}
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <CitySelector cities={cities} selectedId={selectedCityId} onSelect={setSelectedCityId} />
            </div>
            <IndiaMap
              cities={cities}
              selectedId={selectedCityId}
              airQualityMap={airQualityMap}
              anomalyMap={anomalyMap}
              onSelect={handleCitySelect}
            />
            {/* Impact section */}
            <ImpactSection activeAnomalies={activeAnomalies} onNavigate={handleNavigate} />
          </div>
          <div className="px-4 md:px-6 pb-8 animate-fade-in">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

function InitialLoadingSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden md:flex w-56 bg-white border-r border-slate-200 flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div>
              <div className="skeleton w-28 h-4 mb-1" />
              <div className="skeleton w-20 h-3" />
            </div>
          </div>
        </div>
        <div className="px-3 py-4 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton w-full h-10 rounded-lg" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white px-6 py-3 flex items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-lg md:hidden" />
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="skeleton w-32 h-5 mb-1" />
                <div className="skeleton w-48 h-3" />
              </div>
              <div className="skeleton w-px h-8" />
              <div>
                <div className="skeleton w-16 h-7 mb-1" />
                <div className="skeleton w-8 h-3" />
              </div>
            </div>
            <div className="skeleton w-20 h-8 rounded-lg" />
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-white">
            <div className="skeleton w-40 h-5" />
          </div>
          <div className="px-4 md:px-6 pb-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center h-80">
                <div className="skeleton w-32 h-8 rounded-full mb-4" />
                <div className="skeleton w-32 h-32 rounded-full" />
                <div className="skeleton w-24 h-4 mt-4" />
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
          </div>
        </main>
      </div>
    </div>
  );
}
