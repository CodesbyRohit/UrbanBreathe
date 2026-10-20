export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Current Conditions', icon: 'Activity' },
  { id: 'forecast', label: 'Model Forecast', icon: 'TrendingUp' },
  { id: 'sources', label: 'Source Context', icon: 'Search' },
  { id: 'simulator', label: 'Scenario Explorer', icon: 'SlidersHorizontal' },
  { id: 'comparative', label: 'City Comparison', icon: 'BarChart3' },
  { id: 'brief', label: 'Situation Brief', icon: 'FileText' },
  { id: 'advisory', label: 'Citizen Advisory', icon: 'Users' },
  { id: 'method', label: 'Data & Method', icon: 'BookOpen' },
] as const;

export type NavSection = typeof NAV_ITEMS[number]['id'];

export const NAV_SECTION_IDS: readonly string[] = NAV_ITEMS.map(n => n.id);

export const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', description: 'Fine particulate matter' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', description: 'Coarse particulate matter' },
  { key: 'no2', label: 'NO₂', unit: 'µg/m³', description: 'Nitrogen dioxide' },
  { key: 'o3', label: 'O₃', unit: 'µg/m³', description: 'Ozone' },
  { key: 'so2', label: 'SO₂', unit: 'µg/m³', description: 'Sulphur dioxide' },
  { key: 'co', label: 'CO', unit: 'µg/m³', description: 'Carbon monoxide' },
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  traffic: 'Traffic Emissions',
  industry: 'Industrial',
  biomass: 'Biomass Burning',
  dust: 'Dust & Construction',
  others: 'Other Sources',
};

export const POLLUTANT_LABELS: Record<string, string> = {
  pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', o3: 'O₃', so2: 'SO₂', co: 'CO', nh3: 'NH₃', pb: 'Pb',
};

export const pollutantList = (keys: string[]) => keys.map(p => POLLUTANT_LABELS[p] || p).join(', ');

export const API_BASE = '/api';
