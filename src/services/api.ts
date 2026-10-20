import { API_BASE } from '../utils/constants';
import type {
  City,
  AirQualityData,
  SourceContext,
  Forecast,
  Intervention,
  SimulationResult,
  ScenarioAssumptions,
  ExecutiveBrief,
  CitizenAdvisory,
} from '../types';

import { requestJson } from './http';

export { ApiError } from './http';

function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(url, {}, { signal });
}

function postJSON<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { signal });
}

const cityPath = (resource: string, cityId: string) => `${API_BASE}/${resource}/${encodeURIComponent(cityId)}`;

export function getCities(signal?: AbortSignal): Promise<City[]> {
  return fetchJSON<City[]>(`${API_BASE}/cities`, signal);
}

export function getAirQuality(cityId: string, signal?: AbortSignal): Promise<AirQualityData> {
  return fetchJSON<AirQualityData>(cityPath('air-quality', cityId), signal);
}

export function getSources(cityId: string, signal?: AbortSignal): Promise<SourceContext> {
  return fetchJSON<SourceContext>(cityPath('sources', cityId), signal);
}

export function getForecast(cityId: string, signal?: AbortSignal): Promise<Forecast> {
  return fetchJSON<Forecast>(cityPath('forecast', cityId), signal);
}

export function getInterventions(signal?: AbortSignal): Promise<Intervention[]> {
  return fetchJSON<Intervention[]>(`${API_BASE}/simulation/interventions`, signal);
}

export function runSimulation(
  cityId: string,
  interventions: string[],
  assumptions?: ScenarioAssumptions,
  signal?: AbortSignal,
): Promise<SimulationResult> {
  return postJSON<SimulationResult>(`${API_BASE}/simulation/run`, { cityId, interventions, assumptions }, signal);
}

export function generateBrief(cityId: string, signal?: AbortSignal): Promise<ExecutiveBrief> {
  return postJSON<ExecutiveBrief>(`${API_BASE}/brief/generate`, { cityId }, signal);
}

export function getAdvisory(cityId: string, lang = 'en', signal?: AbortSignal): Promise<CitizenAdvisory> {
  return fetchJSON<CitizenAdvisory>(`${cityPath('advisory', cityId)}?lang=${encodeURIComponent(lang)}`, signal);
}
