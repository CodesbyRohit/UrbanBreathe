import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import Sidebar from './Sidebar';
// The default view is bundled eagerly (one fewer request before first data);
// the other views load on demand.
import LiveMonitoring from '../dashboard/LiveMonitoring';
import Header from './Header';
import BootSequence from './BootSequence';
import InitGate from './InitGate';
import { Loader, AlertTriangle } from 'lucide-react';
import type { NavSection } from '../../utils/constants';
import { NAV_SECTION_IDS } from '../../utils/constants';
import { useCities, useAirQuality, useAllCitiesAirQuality } from '../../hooks/useCityData';
import { useTheme, ThemeContext } from '../../hooks/useTheme';
import { parseRoute, formatRoute } from '../../utils/route';
import { ErrorPanel } from '../common/StateViews';

const SourceAttribution = lazy(() => import('../source-attribution/SourceAttribution'));
const PredictiveIntelligence = lazy(() => import('../forecast/PredictiveIntelligence'));
const PolicySimulator = lazy(() => import('../simulator/PolicySimulator'));
const ComparativeIntelligence = lazy(() => import('../comparative/ComparativeIntelligence'));
const ExecutiveBrief = lazy(() => import('../executive-brief/ExecutiveBrief'));
const CitizenAdvisory = lazy(() => import('../citizen-advisory/CitizenAdvisory'));
const MethodPage = lazy(() => import('../method/MethodPage'));

const DEFAULT_ROUTE = { section: 'dashboard', cityId: 'delhi' };

function ModuleFallback() {
  return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader size={16} className="animate-spin" aria-hidden="true" />
        Loading view…
      </div>
    </div>
  );
}

function initialRoute() {
  return typeof window === 'undefined' ? DEFAULT_ROUTE : parseRoute(window.location.hash, NAV_SECTION_IDS, DEFAULT_ROUTE);
}

export default function AppShell() {
  const cities = useCities();
  const cityList = cities.data ?? [];
  const [route, setRoute] = useState(initialRoute);
  const activeSection = route.section as NavSection;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // The presentation intro (tap gate + boot sequence) is optional and off by
  // default; it can be started from the header.
  const [showInitGate, setShowInitGate] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [mapReloadKey, setMapReloadKey] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // An unknown city in the URL falls back to the default once the list is known.
  const selectedCity = cityList.find(c => c.id === route.cityId) ?? null;
  const selectedCityId = selectedCity?.id ?? (cityList.length ? DEFAULT_ROUTE.cityId : route.cityId);
  // Starts in parallel with the city list (the id is validated by the API).
  const airQuality = useAirQuality(selectedCityId);
  const airQualityMap = useAllCitiesAirQuality(cityList, mapReloadKey);

  // Keep the URL hash in sync (shareable links, back/forward navigation).
  useEffect(() => {
    const hash = formatRoute({ section: activeSection, cityId: selectedCityId });
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [activeSection, selectedCityId]);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash, NAV_SECTION_IDS, DEFAULT_ROUTE));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Move focus to the content when the view changes, for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [activeSection]);

  const handleNavigate = useCallback((section: NavSection) => {
    setRoute(r => ({ ...r, section }));
    setSidebarOpen(false);
  }, []);

  const handleCitySelect = useCallback((cityId: string) => {
    setRoute(r => ({ ...r, cityId }));
  }, []);

  const handleRefresh = useCallback(() => {
    airQuality.reload();
    setMapReloadKey(k => k + 1);
  }, [airQuality.reload]);

  const isDemo = Object.values(airQualityMap).some(d => d?.provenance.mode === 'demo')
    || airQuality.data?.provenance.mode === 'demo';

  if (showInitGate) {
    return <InitGate onTap={() => { setShowInitGate(false); setShowBoot(true); }} />;
  }
  if (showBoot) {
    return <BootSequence onComplete={() => setShowBoot(false)} />;
  }

  const renderSection = () => {
    if (!selectedCity) return null;
    switch (activeSection) {
      case 'forecast': return <PredictiveIntelligence cityId={selectedCityId} />;
      case 'sources': return <SourceAttribution city={selectedCity} />;
      case 'simulator': return <PolicySimulator city={selectedCity} />;
      case 'comparative': return <ComparativeIntelligence cities={cityList} airQualityMap={airQualityMap} selectedId={selectedCityId} onSelectCity={handleCitySelect} />;
      case 'brief': return <ExecutiveBrief city={selectedCity} />;
      case 'advisory': return <CitizenAdvisory city={selectedCity} />;
      case 'method': return <MethodPage />;
      case 'dashboard':
      default:
        return (
          <LiveMonitoring
            city={selectedCity}
            resource={airQuality}
            cities={cityList}
            airQualityMap={airQualityMap}
            onSelectCity={handleCitySelect}
          />
        );
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className="print-root flex h-screen bg-slate-50">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        <Sidebar activeSection={activeSection} onSectionChange={handleNavigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            cities={cityList}
            selectedCityId={selectedCityId}
            onSelectCity={handleCitySelect}
            airQuality={airQuality.data}
            loading={airQuality.loading}
            onRefresh={handleRefresh}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenMenu={() => setSidebarOpen(true)}
            onStartIntro={() => setShowInitGate(true)}
          />

          <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 overflow-auto focus:outline-none">
            {isDemo && (
              <div className="bg-amber-100 border-b border-amber-300 px-4 md:px-6 py-2 text-xs text-amber-900 flex items-center gap-2" role="status">
                <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
                <span><strong>DEMO DATA</strong> — the server is running with DATA_MODE=demo. Values are illustrative fixtures, not measurements or model output.</span>
              </div>
            )}
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-5">
              {cities.error && !cities.data ? (
                <ErrorPanel title="The city list could not be loaded" message={cities.error} onRetry={cities.reload} />
              ) : cities.loading && !cities.data ? (
                <ModuleFallback />
              ) : (
                <Suspense fallback={<ModuleFallback />}>{renderSection()}</Suspense>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
