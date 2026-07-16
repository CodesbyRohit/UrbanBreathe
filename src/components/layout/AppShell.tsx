import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CitySelector from '../common/CitySelector';
import LiveMonitoring from '../dashboard/LiveMonitoring';
import SourceAttribution from '../source-attribution/SourceAttribution';
import PredictiveIntelligence from '../forecast/PredictiveIntelligence';
import PolicySimulator from '../simulator/PolicySimulator';
import ExecutiveBrief from '../executive-brief/ExecutiveBrief';
import CitizenAdvisory from '../citizen-advisory/CitizenAdvisory';
import type { AirQualityData } from '../../types';
import type { NavSection } from '../../utils/constants';
import { useCities, useAirQuality } from '../../hooks/useCityData';

export default function AppShell() {
  const { cities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
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
    switch (activeSection) {
      case 'dashboard': return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
      case 'sources': return <SourceAttribution cityId={selectedCityId} />;
      case 'forecast': return <PredictiveIntelligence cityId={selectedCityId} />;
      case 'simulator': return <PolicySimulator cityId={selectedCityId} />;
      case 'brief': return <ExecutiveBrief cityId={selectedCityId} />;
      case 'advisory': return <CitizenAdvisory cityId={selectedCityId} />;
      default: return <LiveMonitoring city={selectedCity} airQuality={airQuality} loading={aqLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          city={selectedCity}
          airQuality={airQuality}
          loading={aqLoading}
          onRefresh={handleRefresh}
          lastUpdated={lastUpdatedRef.current}
        />
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <CitySelector cities={cities} selectedId={selectedCityId} onSelect={setSelectedCityId} />
          </div>
          <div className="px-6 pb-8 animate-fade-in">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
