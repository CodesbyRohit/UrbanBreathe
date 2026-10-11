// 72-hour outlook from the CAMS model forecast (via Open-Meteo).
//
// This replaces a heuristic that started every city at AQI 150, added random
// noise and reported a made-up "confidence". The values here are model output
// passed through unchanged; nothing is claimed about accuracy because the
// forecast has not been evaluated against observations or a persistence baseline.

import { computeNaqi } from '../domain/naqi.js';
import { getIndiaSeason } from '../domain/season.js';
import { provenanceOf, NAQI_LABELS } from './cityAirQuality.js';

const HOUR_MS = 3600_000;

export const FORECAST_EVALUATION_NOTE =
  'Not evaluated: this model forecast has not yet been compared against station observations or a persistence baseline, so no accuracy or confidence is claimed.';

export const FORECAST_NAQI_NOTE =
  'Each point applies the CPCB NAQI method to running averages ending at that hour; windows near the start mix modelled recent hours with forecast hours.';

export function buildForecast(ctx, { horizonHours = 72 } = {}) {
  const refMs = Date.parse(ctx.referenceTime);
  const points = [];
  ctx.aq.times.forEach((time, i) => {
    const hoursAhead = Math.round((Date.parse(time) - refMs) / HOUR_MS);
    if (hoursAhead < 1 || hoursAhead > horizonHours) return;
    const naqi = computeNaqi(ctx.input, time);
    points.push({
      time,
      hoursAhead,
      pm25: ctx.aq.series.pm25[i],
      pm10: ctx.aq.series.pm10[i],
      naqi: naqi.value,
      naqiStatus: naqi.status,
      naqiIsLowerBound: naqi.isLowerBound,
      category: naqi.category,
      dominantPollutants: naqi.dominantPollutants,
    });
  });

  const withValue = points.filter(p => p.naqi !== null);
  const peak = withValue.length
    ? withValue.reduce((best, p) => (p.naqi > best.naqi ? p : best), withValue[0])
    : null;
  const kind = ctx.aq.source.kind;

  return {
    cityId: ctx.city.id,
    kind: kind === 'demo' ? 'demo' : 'model-forecast',
    model: ctx.aq.source.model,
    naqiLabel: NAQI_LABELS[kind],
    referenceTime: ctx.referenceTime,
    issuedAt: ctx.aq.retrievedAt,
    horizonHours,
    evaluated: false,
    evaluationNote: FORECAST_EVALUATION_NOTE,
    naqiNote: FORECAST_NAQI_NOTE,
    points,
    peak,
    season: getIndiaSeason(ctx.now, ctx.city.timezone),
    provenance: provenanceOf(ctx),
    generatedAt: ctx.now.toISOString(),
  };
}
