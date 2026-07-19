import { API_BASE } from '../utils/constants';
import type {
  City,
  AirQualityData,
  SourceAttribution,
  Forecast,
  Intervention,
  SimulationResult,
  ExecutiveBrief,
  CitizenAdvisory,
} from '../types';

const DEFAULT_TIMEOUT = 10_000; // 10 seconds

interface FetchOptions {
  signal?: AbortSignal;
}

async function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: options?.signal || controller.signal,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithBody<T>(url: string, body: unknown, options?: FetchOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options?.signal || controller.signal,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getCities(signal?: AbortSignal): Promise<City[]> {
  return fetchJSON<City[]>(`${API_BASE}/cities`, { signal });
}

export async function getCity(cityId: string, signal?: AbortSignal): Promise<City> {
  return fetchJSON<City>(`${API_BASE}/cities/${cityId}`, { signal });
}

export async function getAirQuality(cityId: string, lat: number, lon: number, signal?: AbortSignal): Promise<AirQualityData> {
  return fetchJSON<AirQualityData>(`${API_BASE}/air-quality/${cityId}?lat=${lat}&lon=${lon}`, { signal });
}

export async function getSources(cityId: string, signal?: AbortSignal): Promise<SourceAttribution> {
  return fetchJSON<SourceAttribution>(`${API_BASE}/sources/${cityId}`, { signal });
}

export async function getForecast(cityId: string, signal?: AbortSignal): Promise<Forecast> {
  return fetchJSON<Forecast>(`${API_BASE}/forecast/${cityId}`, { signal });
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

export async function getAdvisory(cityId: string, signal?: AbortSignal): Promise<CitizenAdvisory> {
  return fetchJSON<CitizenAdvisory>(`${API_BASE}/advisory/${cityId}`, { signal });
}
