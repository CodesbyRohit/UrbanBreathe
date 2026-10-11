export const AQI_COLORS = {
  Good: { color: '#15803d', bg: '#dcfce7' },
  Satisfactory: { color: '#4d7c0f', bg: '#ecfccb' },
  Moderate: { color: '#854d0e', bg: '#fef9c3' },
  Poor: { color: '#c2410c', bg: '#ffedd5' },
  'Very Poor': { color: '#b91c1c', bg: '#fee2e2' },
  Severe: { color: '#6d28d9', bg: '#f3e8ff' },
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Current Conditions', icon: 'Activity' },
  { id: 'sources', label: 'Source Context', icon: 'Search' },
  { id: 'forecast', label: 'Model Forecast', icon: 'TrendingUp' },
  { id: 'simulator', label: 'Scenario Explorer', icon: 'Settings' },
  { id: 'enforcement', label: 'City Priority List', icon: 'Shield' },
  { id: 'comparative', label: 'City Comparison', icon: 'BarChart3' },
  { id: 'brief', label: 'Executive Brief', icon: 'FileText' },
  { id: 'advisory', label: 'Citizen Advisory', icon: 'Users' },
] as const;

export type NavSection = typeof NAV_ITEMS[number]['id'];

export const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', icon: 'Wind', description: 'Fine particulate matter' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', icon: 'Wind', description: 'Coarse particulate matter' },
  { key: 'no2', label: 'NO₂', unit: 'µg/m³', icon: 'Beaker', description: 'Nitrogen dioxide' },
  { key: 'o3', label: 'O₃', unit: 'µg/m³', icon: 'Sun', description: 'Ozone' },
  { key: 'so2', label: 'SO₂', unit: 'µg/m³', icon: 'Beaker', description: 'Sulfur dioxide' },
  { key: 'co', label: 'CO', unit: 'µg/m³', icon: 'Beaker', description: 'Carbon monoxide' },
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
  industry: '#b91c1c',
  biomass: '#c2410c',
  dust: '#a16207',
  others: '#64748b',
};

export const POLLUTANT_LABELS: Record<string, string> = {
  pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', o3: 'O₃', so2: 'SO₂', co: 'CO', nh3: 'NH₃', pb: 'Pb',
};

export const API_BASE = '/api';
