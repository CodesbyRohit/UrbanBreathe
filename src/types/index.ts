export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: string;
  area: string;
  description: string;
  baseAQI: number;
  dominant: string;
}

export interface AnomalyInfo {
  isAnomaly: boolean;
  expectedRange: [number, number];
  deviationPercent: number;
  direction: 'above' | 'below' | 'normal';
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  dataSource?: string;
  anomaly?: AnomalyInfo;
}

export interface SourceAttribution {
  contributions: Record<string, number>;
  confidenceScores: Record<string, number>;
  sortedSources: SourceItem[];
  season: string;
  methodology: string;
}

export interface SourceItem {
  source: string;
  percentage: number;
  confidence: number;
  description: string;
  mitigation: string;
}

export interface ForecastPoint {
  hour: string;
  hoursFromNow: number;
  time: string;
  aqi: number;
  pm25: number;
  category: string;
  color: string;
  confidence: number;
  alerts: string[];
}

export interface Forecast {
  forecast: ForecastPoint[];
  peak: ForecastPoint;
  trend: string;
  confidence: number;
  season: string;
  generatedAt: string;
}

export interface Intervention {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  costUnit: string;
  impact: Record<string, number>;
  timeToEffect: string;
  publicSupport: string;
}

export interface SimulationResult {
  baselineAQI: number;
  predictedAQI: number;
  aqiReduction: number;
  baselinePM25: number;
  predictedPM25: number;
  pm25Reduction: number;
  baselineAdmissions: number;
  predictedAdmissions: number;
  avertedAdmissions: number;
  population: number;
  exposedPopulation: number;
  totalCostCrores: number;
  effectiveness: {
    aqiImprovement: number;
    pm25Reduction: number;
    healthImpact: number;
    feasibility: number;
  };
  interventions: Intervention[];
  category: { label: string; color: string };
  improvementPercentage: number;
}

export interface ExecutiveBrief {
  title: string;
  generatedAt: string;
  date: string;
  classification: string;
  city: City;
  executiveSummary: {
    currentAQI: number;
    category: string;
    dominantPollutant: string;
    trend: string;
    season: string;
    criticality: string;
  };
  currentSituation: {
    overview: string;
    keyMetrics: Record<string, number>;
    weatherInfluence: string[];
  };
  sourceAttribution: {
    topSources: Array<{
      source: string;
      percentage: number;
      confidence: number;
      description: string;
    }>;
    keyFinding: string;
  };
  forecast: {
    summary: string;
    confidence: number;
    peakAQI: number;
    trend: string;
  };
  recommendations: Array<{
    priority: string;
    action: string;
    timeline: string;
    expectedImpact: string;
  }>;
  expectedOutcomes: {
    withIntervention: {
      aqi: number;
      reduction: number;
      improvement: number;
      pm25: number;
      admissionsAverted: number;
      cost: number;
    } | null;
    withoutIntervention: {
      aqi: number;
      pm25: number;
      riskLevel: string;
    };
  };
  publicAdvisory: string;
  confidenceLevel: string;
  methodology: string;
}

export interface CitizenAdvisory {
  cityId: string;
  aqi: number;
  category: string;
  color: string;
  healthAdvisory: string;
  level: {
    color: string;
    icon: string;
    precautions: string[];
    sensitive: string[];
  };
  precautions: string[];
  sensitiveGroups: string[];
  multilingual: Record<string, string>;
  emergency: {
    active: boolean;
    message?: string;
    helpline?: string;
  };
}

export interface AQICategory {
  min: number;
  max: number;
  label: string;
  color: string;
  bg: string;
}
