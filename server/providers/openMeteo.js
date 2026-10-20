// Open-Meteo adapter.
//
// Air quality comes from the CAMS global atmospheric composition forecast served
// by Open-Meteo (modelled data, ~45 km grid over India — not station measurements).
// Weather comes from Open-Meteo's forecast API (also modelled).
// Free tier: non-commercial use, < 10,000 calls/day; data under CC BY 4.0.
// https://open-meteo.com/en/docs/air-quality-api  https://open-meteo.com/en/terms

import { upstreamConfig } from '../config.js';
import { upstreamUnavailable } from '../http/errors.js';

const AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export const AIR_QUALITY_SOURCE = {
  provider: 'open-meteo',
  model: 'CAMS global atmospheric composition forecast',
  kind: 'modelled',
  attribution: 'Air quality: CAMS global forecast via Open-Meteo (CC BY 4.0)',
  url: 'https://open-meteo.com/en/docs/air-quality-api',
};

export const WEATHER_SOURCE = {
  provider: 'open-meteo',
  model: 'Open-Meteo weather forecast',
  kind: 'modelled',
  attribution: 'Weather: Open-Meteo (CC BY 4.0)',
  url: 'https://open-meteo.com/en/docs',
};

// Open-Meteo hourly variable -> internal pollutant key.
const AQ_VARIABLES = {
  pm2_5: 'pm25',
  pm10: 'pm10',
  nitrogen_dioxide: 'no2',
  ozone: 'o3',
  sulphur_dioxide: 'so2',
  carbon_monoxide: 'co',
};

// Open-Meteo labels mass concentration "μg/m³" (Greek mu); accept the micro sign too.
const MICROGRAM_LABELS = new Set(['μg/m³', 'µg/m³']);

// url -> { value, fetchedAt, expires }. `fetchedAt` is when the upstream request
// completed, so cached responses keep reporting their real retrieval time.
const cache = new Map();
// url -> Promise for requests in flight, so concurrent callers (e.g. the
// dashboard loading several views for one city) share a single upstream call.
const inFlight = new Map();

export function clearProviderCache() {
  cache.clear();
  inFlight.clear();
}

async function readBoundedJson(res, label) {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > upstreamConfig.maxResponseBytes) {
    throw upstreamUnavailable(`${label} returned an unexpectedly large response.`, { provider: 'open-meteo', reason: 'response_too_large' });
  }
  const text = await res.text();
  if (text.length > upstreamConfig.maxResponseBytes) {
    throw upstreamUnavailable(`${label} returned an unexpectedly large response.`, { provider: 'open-meteo', reason: 'response_too_large' });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw upstreamUnavailable(`${label} returned an invalid response.`, { provider: 'open-meteo', reason: 'invalid_json' });
  }
}

async function fetchUpstream(url, label) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(upstreamConfig.timeoutMs) });
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    throw upstreamUnavailable(`${label} is unavailable${timedOut ? ' (request timed out)' : ''}.`, { provider: 'open-meteo', reason: timedOut ? 'timeout' : 'network' });
  }
  if (!res.ok) {
    throw upstreamUnavailable(`${label} is unavailable (HTTP ${res.status}).`, { provider: 'open-meteo', reason: res.status === 429 ? 'rate_limited' : 'http_error', status: res.status });
  }
  const value = await readBoundedJson(res, label);
  const entry = { value, fetchedAt: new Date().toISOString(), expires: Date.now() + upstreamConfig.cacheTtlMs };
  if (cache.size >= upstreamConfig.cacheMaxEntries) cache.delete(cache.keys().next().value);
  cache.set(url, entry);
  return entry;
}

/** Cached JSON fetch. Resolves to { value, fetchedAt }; failures are never cached. */
async function fetchJson(url, label) {
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit;
  if (inFlight.has(url)) return inFlight.get(url);
  const pending = fetchUpstream(url, label).finally(() => inFlight.delete(url));
  inFlight.set(url, pending);
  return pending;
}

function schemaError(label, problem) {
  return upstreamUnavailable(`${label} returned data in an unexpected format.`, { provider: 'open-meteo', reason: 'schema_mismatch', problem });
}

/** Open-Meteo times requested with timezone=GMT look like "2026-10-11T18:00" (UTC). */
function toUtcIso(time) {
  const ms = Date.parse(`${time}:00Z`);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

function cleanValue(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Hourly modelled pollutant series around now: 2 past days + 4 forecast days, UTC.
 * Returns { source, retrievedAt, unit: 'ug/m3', times: ISO[], series: { pm25: number|null[] ... } }.
 */
export async function fetchAirQualitySeries(lat, lon) {
  const label = 'Open-Meteo air-quality data';
  const url = `${AQ_URL}?latitude=${lat}&longitude=${lon}` +
    `&hourly=${Object.keys(AQ_VARIABLES).join(',')}` +
    '&past_days=2&forecast_days=4&timezone=GMT';
  const { value: data, fetchedAt } = await fetchJson(url, label);

  const hourly = data?.hourly;
  if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) throw schemaError(label, 'missing hourly.time');
  const times = hourly.time.map(toUtcIso);
  if (times.some(t => t === null)) throw schemaError(label, 'unparseable hourly.time');

  const series = {};
  for (const [variable, key] of Object.entries(AQ_VARIABLES)) {
    const values = hourly[variable];
    if (!Array.isArray(values) || values.length !== times.length) throw schemaError(label, `missing or misaligned ${variable}`);
    const unit = data.hourly_units?.[variable];
    if (!MICROGRAM_LABELS.has(unit)) throw schemaError(label, `unexpected unit for ${variable}: ${unit}`);
    series[key] = values.map(cleanValue);
  }

  return { source: AIR_QUALITY_SOURCE, retrievedAt: fetchedAt, unit: 'ug/m3', times, series };
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function degreesToCompass(deg) {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) return null;
  return COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

/** Current modelled weather. Missing fields are null (never defaulted). */
export async function fetchCurrentWeather(lat, lon) {
  const label = 'Open-Meteo weather data';
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility' +
    '&timezone=GMT';
  const { value: data, fetchedAt } = await fetchJson(url, label);
  const c = data?.current;
  if (!c || typeof c.time !== 'string') throw schemaError(label, 'missing current block');
  const visibilityM = cleanValue(c.visibility);
  return {
    source: WEATHER_SOURCE,
    retrievedAt: fetchedAt,
    observedAt: toUtcIso(c.time),
    temperature: cleanValue(c.temperature_2m),
    humidity: cleanValue(c.relative_humidity_2m),
    windSpeed: cleanValue(c.wind_speed_10m),
    windDirection: degreesToCompass(cleanValue(c.wind_direction_10m)),
    pressure: cleanValue(c.surface_pressure),
    visibility: visibilityM === null ? null : visibilityM / 1000,
  };
}
