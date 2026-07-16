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

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getCities(): Promise<City[]> {
  return fetchJSON<City[]>(`${API_BASE}/cities`);
}

export async function getCity(cityId: string): Promise<City> {
  return fetchJSON<City>(`${API_BASE}/cities/${cityId}`);
}

export async function getAirQuality(cityId: string, lat: number, lon: number): Promise<AirQualityData> {
  return fetchJSON<AirQualityData>(`${API_BASE}/air-quality/${cityId}?lat=${lat}&lon=${lon}`);
}

export async function getSources(cityId: string): Promise<SourceAttribution> {
  return fetchJSON<SourceAttribution>(`${API_BASE}/sources/${cityId}`);
}

export async function getForecast(cityId: string): Promise<Forecast> {
  return fetchJSON<Forecast>(`${API_BASE}/forecast/${cityId}`);
}

export async function getInterventions(): Promise<Intervention[]> {
  return fetchJSON<Intervention[]>(`${API_BASE}/simulation/interventions`);
}

export async function runSimulation(
  cityId: string,
  interventions: string[]
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityId, interventions }),
  });
  if (!res.ok) throw new Error(`Simulation error: ${res.status}`);
  return res.json();
}

export async function generateBrief(
  cityId: string,
  interventions?: string[]
): Promise<ExecutiveBrief> {
  const res = await fetch(`${API_BASE}/brief/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityId, interventions }),
  });
  if (!res.ok) throw new Error(`Brief error: ${res.status}`);
  return res.json();
}

export async function getAdvisory(cityId: string): Promise<CitizenAdvisory> {
  return fetchJSON<CitizenAdvisory>(`${API_BASE}/advisory/${cityId}`);
}
