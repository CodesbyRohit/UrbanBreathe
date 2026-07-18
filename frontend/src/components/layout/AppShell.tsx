import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CitySelector from '../common/CitySelector';
import { Menu, Loader } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { useCities, useAirQuality } from '../../hooks/useCityData';

// Lazy-loaded modules for code-splitting
const LiveMonitoring = lazy(() => import('../dashboard/LiveMonitoring'));
const SourceAttribution = lazy(() => import('../source-attribution/SourceAttribution'));
const PredictiveIntelligence = lazy(() => import('../forecast/PredictiveIntelligence'));
const PolicySimulator = lazy(() => import('../simulator/PolicySimulator'));
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
  const lastUpdatedRef = useRef<string | null>(null);

  const selectedCity = cities.find(c => c.id === selectedCityId) || null;
  const { data: airQuality, loading: aqLoading, refresh: refreshAQ } = useAirQuality(selectedCity);

  useEffect(() => {
    if (airQuality) lastUpdatedRef.current = new Date().toISOString();
  }, [airQuality]);

  const handleRefresh = useCallback(() => {
    refreshAQ();
    lastUpdatedRef.current = new Date().toISOString();
  }, [refreshAQ]);

  const renderSection = () => {
    const section = (() => {
      switch (activeSection) {
        case 'dashboard': return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
        case 'sources': return <SourceAttribution cityId={selectedCityId} />;
        case 'forecast': return <PredictiveIntelligence cityId={selectedCityId} />;
        case 'simulator': return <PolicySimulator cityId={selectedCityId} />;
        case 'brief': return <ExecutiveBrief cityId={selectedCityId} />;
        case 'advisory': return <CitizenAdvisory cityId={selectedCityId} />;
        default: return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
      }
    })();
    return <Suspense fallback={<ModuleFallback />}>{section}</Suspense>;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Skip-to-content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: mobile hamburger + Header — div wrapper avoids nested <header> */}
        <div className="bg-white px-4 md:px-6 py-3 flex items-center gap-3">
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
          />
        </div>

        <main id="main-content" className="flex-1 overflow-auto">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-white">
            <CitySelector cities={cities} selectedId={selectedCityId} onSelect={setSelectedCityId} />
          </div>
          <div className="px-4 md:px-6 pb-8 animate-fade-in">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
