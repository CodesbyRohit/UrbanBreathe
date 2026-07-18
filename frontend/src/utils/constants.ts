export const AQI_COLORS = {
  Good: { color: '#16a34a', bg: '#dcfce7' },
  Satisfactory: { color: '#65a30d', bg: '#ecfccb' },
  Moderate: { color: '#eab308', bg: '#fef9c3' },
  Poor: { color: '#f97316', bg: '#ffedd5' },
  'Very Poor': { color: '#ef4444', bg: '#fee2e2' },
  Severe: { color: '#7c3aed', bg: '#f3e8ff' },
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Live Monitoring', icon: 'Activity' },
  { id: 'sources', label: 'Source Attribution', icon: 'Search' },
  { id: 'forecast', label: 'Predictive Intelligence', icon: 'TrendingUp' },
  { id: 'simulator', label: 'Policy Simulator', icon: 'Settings' },
  { id: 'brief', label: 'Executive Brief', icon: 'FileText' },
  { id: 'advisory', label: 'Citizen Advisory', icon: 'Users' },
] as const;

export type NavSection = typeof NAV_ITEMS[number]['id'];

export const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', icon: 'Wind', description: 'Fine particulate matter' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', icon: 'Wind', description: 'Coarse particulate matter' },
  { key: 'no2', label: 'NO₂', unit: 'ppb', icon: 'Beaker', description: 'Nitrogen dioxide' },
  { key: 'o3', label: 'O₃', unit: 'ppb', icon: 'Sun', description: 'Ozone' },
  { key: 'so2', label: 'SO₂', unit: 'ppb', icon: 'Beaker', description: 'Sulfur dioxide' },
  { key: 'co', label: 'CO', unit: 'ppb', icon: 'Beaker', description: 'Carbon monoxide' },
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  traffic: 'Traffic Emissions',
  industry: 'Industrial',
  biomass: 'Biomass Burning',
  dust: 'Dust & Construction',
  others: 'Other Sources',
};

export const SOURCE_COLORS: Record<string, string> = {
  traffic: '#3b91e8',
  industry: '#ef4444',
  biomass: '#f97316',
  dust: '#eab308',
  others: '#94a3b8',
};

export const API_BASE = '/api';
