// Loads a city's air-quality context (provider data + NAQI) for all routes.

import { getDataMode } from '../config.js';
import { fetchAirQualitySeries, fetchCurrentWeather } from '../providers/openMeteo.js';
import { demoAirQualitySeries, demoWeather } from '../data/demoFixtures.js';
import { computeNaqi } from '../domain/naqi.js';
import { upstreamUnavailable } from '../http/errors.js';

export const POLLUTANT_KEYS = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'];

export const NAQI_LABELS = {
  modelled: 'NAQI-method estimate from modelled CAMS data — not an official CPCB station AQI',
  demo: 'DEMO — computed from illustrative fixture values, not real data',
};

const ANOMALY_UNAVAILABLE = {
  status: 'unavailable',
  isAnomaly: false,
  reason: 'Anomaly detection needs a historical baseline, which is not implemented yet.',
};

/** Latest timestamp in `times` that is at or before `now`. */
export function referenceHour(times, now) {
  const nowMs = now.getTime();
  let best = null;
  for (const t of times) {
    const ms = Date.parse(t);
    if (ms <= nowMs && (best === null || ms > Date.parse(best))) best = t;
  }
  return best;
}

export function seriesInput(aq) {
  return Object.fromEntries(POLLUTANT_KEYS.map(key => [key, {
    unit: aq.unit,
    points: aq.times.map((time, i) => ({ time, value: aq.series[key][i] })),
  }]));
}

export function valueAt(aq, key, time) {
  const i = aq.times.indexOf(time);
  return i === -1 ? null : aq.series[key][i];
}

/**
 * Load provider data for a city and compute the NAQI at the current hour.
 * Live mode: a provider failure throws 503 (no fixture substitution).
 * Demo mode: deterministic fixtures, labelled `demo` throughout.
 */
export async function loadCityContext(city, { now = new Date() } = {}) {
  const mode = getDataMode();
  let aq;
  let weather = null;
  let weatherError = null;

  if (mode === 'demo') {
    aq = demoAirQualitySeries(city.id, now);
    weather = demoWeather(city.id, now);
    if (!aq) throw upstreamUnavailable(`No demo fixture for "${city.id}".`, { provider: 'demo-fixture', reason: 'missing_fixture' });
  } else {
    const [aqResult, weatherResult] = await Promise.allSettled([
      fetchAirQualitySeries(city.lat, city.lon),
      fetchCurrentWeather(city.lat, city.lon),
    ]);
    if (aqResult.status === 'rejected') throw aqResult.reason;
    aq = aqResult.value;
    if (weatherResult.status === 'fulfilled') weather = weatherResult.value;
    else weatherError = weatherResult.reason?.message || 'Weather data unavailable.';
  }

  const referenceTime = referenceHour(aq.times, now);
  if (!referenceTime) {
    throw upstreamUnavailable('Air-quality data has no value at or before the current hour.', { provider: aq.source.provider, reason: 'no_current_data' });
  }
  const input = seriesInput(aq);
  const naqi = computeNaqi(input, referenceTime);
  return { city, mode, aq, weather, weatherError, referenceTime, input, naqi, now };
}

export function describeNaqi(ctx) {
  const kind = ctx.aq.source.kind;
  return { ...ctx.naqi, basis: kind, officialCpcb: false, label: NAQI_LABELS[kind] };
}

export function provenanceOf(ctx) {
  return {
    mode: ctx.mode,
    isLive: ctx.mode === 'live',
    airQuality: { ...ctx.aq.source, retrievedAt: ctx.aq.retrievedAt },
    weather: ctx.weather
      ? { ...ctx.weather.source, retrievedAt: ctx.weather.retrievedAt, observedAt: ctx.weather.observedAt }
      : { status: 'unavailable', reason: ctx.weatherError },
  };
}

/** Last 24 hourly PM values up to the reference hour. */
export function recentHistory(ctx, hours = 24) {
  const refMs = Date.parse(ctx.referenceTime);
  const out = [];
  ctx.aq.times.forEach((time, i) => {
    const ms = Date.parse(time);
    if (ms <= refMs && ms > refMs - hours * 3600_000) {
      out.push({ time, pm25: ctx.aq.series.pm25[i], pm10: ctx.aq.series.pm10[i] });
    }
  });
  return out;
}

export function toAirQualityResponse(ctx) {
  const naqi = describeNaqi(ctx);
  const w = ctx.weather;
  const current = Object.fromEntries(POLLUTANT_KEYS.map(k => [k, valueAt(ctx.aq, k, ctx.referenceTime)]));
  return {
    cityId: ctx.city.id,
    referenceTime: ctx.referenceTime,
    aqi: naqi.value,
    aqiStatus: naqi.status,
    aqiIsLowerBound: naqi.isLowerBound,
    aqiCategory: naqi.category,
    naqi,
    ...current, // hourly concentrations at the reference hour
    units: Object.fromEntries(POLLUTANT_KEYS.map(k => [k, 'µg/m³'])),
    history: recentHistory(ctx),
    temperature: w?.temperature ?? null,
    humidity: w?.humidity ?? null,
    windSpeed: w?.windSpeed ?? null,
    windDirection: w?.windDirection ?? null,
    pressure: w?.pressure ?? null,
    visibility: w?.visibility ?? null,
    provenance: provenanceOf(ctx),
    dataSource: ctx.aq.source.kind === 'demo' ? 'demo' : ctx.aq.source.provider,
    anomaly: ANOMALY_UNAVAILABLE,
  };
}
