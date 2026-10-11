// Executive brief assembled from the same live context as the other endpoints.
//
// Replaces a generator that read static fallback values (producing "AQI of
// undefined" with category Severe and criticality MODERATE), stamped the output
// "CONFIDENTIAL — FOR OFFICIAL USE ONLY", hard-coded confidence "High",
// attached made-up impact percentages to recommendations and invented
// "without intervention" figures (PM2.5 × 1.1).

import { CPCB_HEALTH_STATEMENTS } from '../domain/naqi.js';
import { formatDateInZone, getIndiaSeason } from '../domain/season.js';
import { describeNaqi, provenanceOf, valueAt } from './cityAirQuality.js';
import { buildForecast } from './forecast.js';
import { buildSourceContext } from './sourceIndicators.js';
import { runScenario } from './scenario.js';

const POLLUTANT_LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', o3: 'O₃', so2: 'SO₂', co: 'CO', nh3: 'NH₃', pb: 'Pb' };

const CPCB_ACTIONS_SOURCE = 'CPCB CUPS/82/2014-15, §3.4 (broad guidelines for Very Poor and Severe AQI)';

function displayIndex(value, isLowerBound) {
  if (value === null) return 'unavailable';
  return isLowerBound ? `${value}+` : String(value);
}

function timeInZone(iso, timeZone) {
  return new Intl.DateTimeFormat('en-IN', { timeZone, hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(iso));
}

function buildRecommendations(city, naqi) {
  const verify = {
    priority: 'ROUTINE',
    action: 'Check the official CPCB station AQI before taking operational decisions; this brief uses modelled data.',
    basis: 'Data limitation',
  };
  if (naqi.status !== 'ok') {
    return [{ priority: 'HIGH', action: 'Data are insufficient for a NAQI-method estimate. Use official CPCB station data.', basis: 'Data limitation' }];
  }
  const recs = [];
  if (naqi.category === 'Very Poor' || naqi.category === 'Severe') {
    recs.push(
      { priority: 'HIGH', action: 'Regulating agencies: strict vigilance and no tolerance for visibly polluting vehicles, industries, open burning and construction activities; regulate traffic; identify and act on sources contributing significantly.', basis: CPCB_ACTIONS_SOURCE },
      { priority: 'HIGH', action: 'Public: minimise travel; prefer public transport, cycling, walking or car-pooling; minimise diesel generator use; people with heart disease or asthma may consider avoiding undue exposure.', basis: CPCB_ACTIONS_SOURCE },
    );
    if (city.id === 'delhi') {
      recs.push({ priority: 'HIGH', action: 'Check the Graded Response Action Plan (GRAP) stage currently notified by CAQM for Delhi-NCR.', basis: 'GRAP applies to Delhi-NCR' });
    }
  }
  if (['Poor', 'Very Poor', 'Severe'].includes(naqi.category)) {
    recs.push({ priority: 'MEDIUM', action: `Issue the CPCB health statement for the ${naqi.category} category to the public and to sensitive groups.`, basis: 'CPCB CUPS/82/2014-15, Table 3.12' });
  }
  recs.push(verify);
  return recs;
}

function weatherContext(weather) {
  if (!weather) return ['Weather data unavailable.'];
  const notes = [];
  if (weather.windSpeed !== null && weather.windSpeed < 5) {
    notes.push(`Light winds (${weather.windSpeed} km/h) can limit dispersion of pollutants.`);
  }
  return notes.length ? notes : ['No meteorological flags computed.'];
}

export function generateBrief(ctx, interventionIds = []) {
  const { city } = ctx;
  const naqi = describeNaqi(ctx);
  const forecast = buildForecast(ctx);
  const sources = buildSourceContext(ctx);
  const scenario = interventionIds.length ? runScenario(ctx, interventionIds) : null;
  const tz = city.timezone;
  const display = displayIndex(naqi.value, naqi.isLowerBound);
  const dominant = naqi.dominantPollutants.map(p => POLLUTANT_LABELS[p] || p);
  const pm25 = naqi.subIndices.pm25;
  const pm10 = naqi.subIndices.pm10;

  const overview = naqi.status === 'ok'
    ? `${city.name}: NAQI-method estimate ${display} (${naqi.category}) for ${timeInZone(ctx.referenceTime, tz)} IST, from modelled CAMS data. ` +
      `Dominant pollutant: ${dominant.join(', ')}. ` +
      `24-hour mean PM2.5 ${pm25?.average ?? 'n/a'} µg/m³; PM10 ${pm10?.average ?? 'n/a'} µg/m³.`
    : `${city.name}: a NAQI-method estimate could not be computed — ${naqi.reasons.join(' ')}`;

  const peak = forecast.peak;
  const forecastSummary = peak
    ? `Highest NAQI-method estimate in the next ${forecast.horizonHours} hours of the CAMS model forecast: ${displayIndex(peak.naqi, peak.naqiIsLowerBound)} (${peak.category}) at ${timeInZone(peak.time, tz)} IST, ${peak.hoursAhead} h ahead.`
    : 'No NAQI-method estimate is available for the forecast period.';

  return {
    title: `Air Quality Situation Brief — ${city.name}`,
    generatedAt: ctx.now.toISOString(),
    date: formatDateInZone(ctx.now, tz),
    city: { id: city.id, name: city.name, state: city.state },
    dataBasis: {
      label: naqi.label,
      referenceTime: ctx.referenceTime,
      provenance: provenanceOf(ctx),
    },
    executiveSummary: {
      currentAQI: naqi.value,
      currentAQIIsLowerBound: naqi.isLowerBound,
      aqiStatus: naqi.status,
      category: naqi.category,
      dominantPollutants: dominant,
      forecastPeakAQI: peak?.naqi ?? null,
      forecastPeakIsLowerBound: peak?.naqiIsLowerBound ?? false,
      season: getIndiaSeason(ctx.now, tz).label,
    },
    currentSituation: {
      overview,
      keyMetrics: {
        pm25: valueAt(ctx.aq, 'pm25', ctx.referenceTime),
        pm10: valueAt(ctx.aq, 'pm10', ctx.referenceTime),
        no2: valueAt(ctx.aq, 'no2', ctx.referenceTime),
        o3: valueAt(ctx.aq, 'o3', ctx.referenceTime),
        so2: valueAt(ctx.aq, 'so2', ctx.referenceTime),
        co: valueAt(ctx.aq, 'co', ctx.referenceTime),
      },
      keyMetricsNote: 'Hourly modelled concentrations at the reference hour, µg/m³.',
      weatherContext: weatherContext(ctx.weather),
    },
    sourceContext: {
      disclaimer: sources.disclaimer,
      indicators: sources.indicators,
    },
    forecast: {
      summary: forecastSummary,
      evaluated: false,
      evaluationNote: forecast.evaluationNote,
      peak,
    },
    recommendations: buildRecommendations(city, naqi),
    scenario,
    healthStatement: naqi.category ? CPCB_HEALTH_STATEMENTS[naqi.category] : null,
    limitations: [
      'Air-quality values are CAMS model output (about 45 km grid for India), not station measurements.',
      'The NAQI-method estimate is not the official CPCB station AQI.',
      'The forecast has not been evaluated against observations or a baseline.',
      'No source apportionment, health-impact or cost estimates are made.',
    ],
    methodology: 'CPCB NAQI method (CUPS/82/2014-15) applied to 24-hour / 8-hour running means of hourly CAMS model data retrieved from Open-Meteo. See docs/methodology/naqi.md.',
  };
}
