import { API_BASE } from '../utils/constants';
import type {
  City,
  AirQualityData,
  SourceContext,
  Forecast,
  Intervention,
  SimulationResult,
  ExecutiveBrief,
  CitizenAdvisory,
} from '../types';

import { requestJson } from './http';

export { ApiError } from './http';

interface FetchOptions {
  signal?: AbortSignal;
}

function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  return requestJson<T>(url, {}, options);
}

function fetchWithBody<T>(url: string, body: unknown, options?: FetchOptions): Promise<T> {
  return requestJson<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, options);
}

export async function getCities(signal?: AbortSignal): Promise<City[]> {
  return fetchJSON<City[]>(`${API_BASE}/cities`, { signal });
}

export async function getCity(cityId: string, signal?: AbortSignal): Promise<City> {
  return fetchJSON<City>(`${API_BASE}/cities/${encodeURIComponent(cityId)}`, { signal });
}

export async function getAirQuality(cityId: string, signal?: AbortSignal): Promise<AirQualityData> {
  return fetchJSON<AirQualityData>(`${API_BASE}/air-quality/${encodeURIComponent(cityId)}`, { signal });
}

export async function getSources(cityId: string, signal?: AbortSignal): Promise<SourceContext> {
  return fetchJSON<SourceContext>(`${API_BASE}/sources/${encodeURIComponent(cityId)}`, { signal });
}

export async function getForecast(cityId: string, signal?: AbortSignal): Promise<Forecast> {
  return fetchJSON<Forecast>(`${API_BASE}/forecast/${encodeURIComponent(cityId)}`, { signal });
}

export async function getInterventions(signal?: AbortSignal): Promise<Intervention[]> {
  return fetchJSON<Intervention[]>(`${API_BASE}/simulation/interventions`, { signal });
}

export async function runSimulation(
  cityId: string,
  interventions: string[],
  signal?: AbortSignal
): Promise<SimulationResult> {
  return fetchWithBody<SimulationResult>(
    `${API_BASE}/simulation/run`,
    { cityId, interventions },
    { signal }
  );
}

export async function generateBrief(
  cityId: string,
  interventions?: string[],
  signal?: AbortSignal
): Promise<ExecutiveBrief> {
  return fetchWithBody<ExecutiveBrief>(
    `${API_BASE}/brief/generate`,
    { cityId, interventions },
    { signal }
  );
}

export async function getAdvisory(cityId: string, lang = 'en', signal?: AbortSignal): Promise<CitizenAdvisory> {
  return fetchJSON<CitizenAdvisory>(`${API_BASE}/advisory/${encodeURIComponent(cityId)}?lang=${encodeURIComponent(lang)}`, { signal });
}
