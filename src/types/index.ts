export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  timezone: string;
  population: string;
  area: string;
  description: string;
}

export type DataKind = 'modelled' | 'measured' | 'demo';
export type IndexStatus = 'ok' | 'insufficient_data';

export interface SourceInfo {
  provider: string;
  model: string;
  kind: DataKind;
  attribution: string;
  url: string | null;
  retrievedAt?: string;
  observedAt?: string | null;
}

export interface Provenance {
  mode: 'live' | 'demo';
  isLive: boolean;
  airQuality: SourceInfo;
  weather: SourceInfo | { status: 'unavailable'; reason: string | null };
}

export interface SubIndex {
  status: IndexStatus;
  unit: string;
  averagingHours: number;
  validHours: number;
  requiredHours: number;
  average: number | null;
  subIndex: number | null;
  isLowerBound: boolean;
  category: string | null;
}

export interface NaqiResult {
  status: IndexStatus;
  value: number | null;
  isLowerBound: boolean;
  category: string | null;
  dominantPollutants: string[];
  subIndices: Record<string, SubIndex>;
  reasons: string[];
  basis: DataKind;
  officialCpcb: false;
  label: string;
}

export interface AnomalyInfo {
  status: 'unavailable';
  isAnomaly: false;
  reason: string;
}

export interface HistoryPoint {
  time: string;
  pm25: number | null;
  pm10: number | null;
}

export interface AirQualityData {
  cityId: string;
  referenceTime: string;
  aqi: number | null;
  aqiStatus: IndexStatus;
  aqiIsLowerBound: boolean;
  aqiCategory: string | null;
  naqi: NaqiResult;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  so2: number | null;
  co: number | null;
  units: Record<string, string>;
  history: HistoryPoint[];
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  pressure: number | null;
  visibility: number | null;
  provenance: Provenance;
  dataSource: string;
  anomaly: AnomalyInfo;
}

export interface SourceIndicator {
  id: string;
  label: string;
  value: number | string[] | null;
  basis: DataKind;
  explanation: string;
  caveat: string;
  unavailableReason: string | null;
  inputs?: { pm25: number | null; pm10: number | null; unit: string };
}

export interface SourceCategory {
  source: string;
  description: string;
  mitigation: string;
}

export interface Season {
  id: string;
  label: string;
  timeZone: string;
  basis: string;
}

export interface SourceContext {
  cityId: string;
  status: 'indicators_only';
  disclaimer: string;
  indicators: SourceIndicator[];
  sourceCategories: SourceCategory[];
  season: Season;
  provenance: Provenance;
  generatedAt: string;
}

export interface ForecastPoint {
  time: string;
  hoursAhead: number;
  pm25: number | null;
  pm10: number | null;
  naqi: number | null;
  naqiStatus: IndexStatus;
  naqiIsLowerBound: boolean;
  category: string | null;
  dominantPollutants: string[];
}

export interface Forecast {
  cityId: string;
  kind: 'model-forecast' | 'demo';
  model: string;
  naqiLabel: string;
  referenceTime: string;
  issuedAt: string;
  horizonHours: number;
  evaluated: false;
  evaluationNote: string;
  naqiNote: string;
  points: ForecastPoint[];
  peak: ForecastPoint | null;
  season: Season;
  provenance: Provenance;
  generatedAt: string;
}

export interface Intervention {
  id: string;
  name: string;
  category: string;
  description: string;
  assumedReduction: Record<string, number>;
  assumptionNote?: string;
}

export interface SimulationResult {
  cityId: string;
  kind: 'illustrative-scenario';
  disclaimer: string;
  naqiLabel: string;
  status: IndexStatus;
  reasons: string[];
  baselineAQI: number | null;
  baselineAQIIsLowerBound: boolean;
  baselineCategory: string | null;
  scenarioAQI: number | null;
  scenarioAQIIsLowerBound: boolean;
  scenarioCategory: string | null;
  aqiChange: number | null;
  baselinePM25: number | null;
  scenarioPM25: number | null;
  combinedReductions: Record<string, number>;
  combinationRule: string;
  interventions: Intervention[];
  assumptionNote: string;
  provenance: Provenance;
  generatedAt: string;
}

export interface BriefRecommendation {
  priority: string;
  action: string;
  basis: string;
}

export interface ExecutiveBrief {
  title: string;
  generatedAt: string;
  date: string;
  city: { id: string; name: string; state: string };
  dataBasis: { label: string; referenceTime: string; provenance: Provenance };
  executiveSummary: {
    currentAQI: number | null;
    currentAQIIsLowerBound: boolean;
    aqiStatus: IndexStatus;
    category: string | null;
    dominantPollutants: string[];
    forecastPeakAQI: number | null;
    forecastPeakIsLowerBound: boolean;
    season: string;
  };
  currentSituation: {
    overview: string;
    keyMetrics: Record<string, number | null>;
    keyMetricsNote: string;
    weatherContext: string[];
  };
  sourceContext: { disclaimer: string; indicators: SourceIndicator[] };
  forecast: { summary: string; evaluated: false; evaluationNote: string; peak: ForecastPoint | null };
  recommendations: BriefRecommendation[];
  scenario: SimulationResult | null;
  healthStatement: string | null;
  limitations: string[];
  methodology: string;
}

export interface CitizenAdvisory {
  cityId: string;
  status: IndexStatus;
  reasons: string[];
  aqi: number | null;
  aqiIsLowerBound: boolean;
  category: string | null;
  naqiLabel: string;
  color: string;
  healthStatement: string | null;
  healthStatementSource: string;
  healthAdvisory: string;
  lang: string;
  message: string | null;
  precautions: string[];
  sensitiveGroups: string[];
  multilingual: Record<string, string | null>;
  multilingualNote: string;
  emergencyContacts: { label: string; number: string }[];
  contactsNote: string;
  disclaimer: string;
  provenance: Provenance;
  generatedAt: string;
}
