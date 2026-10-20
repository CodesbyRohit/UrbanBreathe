// CPCB National Air Quality Index (NAQI) calculation.
//
// Sources (see docs/methodology/naqi.md for full references and open questions):
//  - CPCB, "National Air Quality Index", Control of Urban Pollution Series
//    CUPS/82/2014-15 — Table 3.11 (breakpoints), Table 3.12 (health statements),
//    sub-index formula of §3.5 (including "subtract one from ILO, if ILO is
//    greater than 50") and maximum-operator aggregation.
//  - CPCB, "How is AQI calculated?" (airquality.cpcb.gov.in/ccr_docs/How_AQI_Calculated.pdf):
//    24-hour averages (8-hour for CO and O3); overall AQI only when at least three
//    pollutants are available and one of them is PM2.5 or PM10; at least 16 hours of
//    data for a sub-index; running averages.

import { toCpcbUnit, CPCB_UNITS } from './units.js';

export const NAQI_METHOD = {
  id: 'cpcb-naqi-2014',
  name: 'CPCB National Air Quality Index',
  reference: 'CPCB CUPS/82/2014-15, Table 3.11; CPCB "How is AQI calculated?"',
};

// AQI index range for each category, in table order.
export const NAQI_CATEGORIES = [
  { label: 'Good', min: 0, max: 50 },
  { label: 'Satisfactory', min: 51, max: 100 },
  { label: 'Moderate', min: 101, max: 200 },
  { label: 'Poor', min: 201, max: 300 },
  { label: 'Very Poor', min: 301, max: 400 },
  { label: 'Severe', min: 401, max: 500 },
];

// CPCB CUPS/82/2014-15 Table 3.12 — health statements, verbatim.
export const CPCB_HEALTH_STATEMENTS = {
  Good: 'Minimal impact',
  Satisfactory: 'May cause minor breathing discomfort to sensitive people',
  Moderate: 'May cause breathing discomfort to the people with lung disease such as asthma and discomfort to people with heart disease, children and older adults',
  Poor: 'May cause breathing discomfort to people on prolonged exposure and discomfort to people with heart disease with short exposure',
  'Very Poor': 'May cause respiratory illness to the people on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases',
  Severe: 'May cause respiratory effects even on healthy people and serious health impacts on people with lung/heart diseases. The health impacts may be experienced even during light physical activity',
};

// CPCB CUPS/82/2014-15 Table 3.11. Concentration bands for Good..Very Poor;
// Severe is open-ended above `severeAbove` (the table lists e.g. "430+").
// `decimals` is the precision of the published breakpoints; concentrations are
// rounded to it before band lookup so values between published bands (e.g. 30.5)
// fall into a band instead of a gap.
export const NAQI_BREAKPOINTS = {
  pm10: { averagingHours: 24, decimals: 0, bands: [[0, 50], [51, 100], [101, 250], [251, 350], [351, 430]], severeAbove: 430 },
  pm25: { averagingHours: 24, decimals: 0, bands: [[0, 30], [31, 60], [61, 90], [91, 120], [121, 250]], severeAbove: 250 },
  no2: { averagingHours: 24, decimals: 0, bands: [[0, 40], [41, 80], [81, 180], [181, 280], [281, 400]], severeAbove: 400 },
  o3: { averagingHours: 8, decimals: 0, bands: [[0, 50], [51, 100], [101, 168], [169, 208], [209, 748]], severeAbove: 748 },
  co: { averagingHours: 8, decimals: 1, bands: [[0, 1.0], [1.1, 2.0], [2.1, 10], [10.1, 17], [17.1, 34]], severeAbove: 34 },
  so2: { averagingHours: 24, decimals: 0, bands: [[0, 40], [41, 80], [81, 380], [381, 800], [801, 1600]], severeAbove: 1600 },
  nh3: { averagingHours: 24, decimals: 0, bands: [[0, 200], [201, 400], [401, 800], [801, 1200], [1201, 1800]], severeAbove: 1800 },
  pb: { averagingHours: 24, decimals: 1, bands: [[0, 0.5], [0.6, 1.0], [1.1, 2.0], [2.1, 3.0], [3.1, 3.5]], severeAbove: 3.5 },
};

export const NAQI_PARAMETERS = Object.keys(NAQI_BREAKPOINTS);
export const PARTICULATE_PARAMETERS = ['pm25', 'pm10'];
export const MIN_POLLUTANTS = 3;

// Minimum valid hourly values inside the averaging window.
// 24-hour: 16 hours — verified (CPCB "How is AQI calculated?").
// 8-hour: CPCB does not state a minimum in the documents reviewed. We require the
// complete 8 hours (no tolerance for gaps) rather than invent a threshold.
export const MIN_VALID_HOURS = { 24: 16, 8: 8 };

const HOUR_MS = 3600_000;

export function categoryForIndex(index) {
  if (typeof index !== 'number' || !Number.isFinite(index)) return null;
  return NAQI_CATEGORIES.find(c => index <= c.max)?.label ?? 'Severe';
}

function roundTo(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Sub-index for one pollutant from its averaged concentration, already in the
 * CPCB unit (µg/m³; mg/m³ for CO).
 * Returns { subIndex, isLowerBound, category, concentrationBand } or null for
 * unusable input. `category` follows the index value (the same rule as the
 * overall AQI), `concentrationBand` is the Table 3.11 row the concentration
 * falls in. They differ only exactly at a band's lower breakpoint, where the
 * "subtract one from ILO" rule yields the previous category's top index (e.g.
 * PM2.5 61 µg/m³ -> 100, Satisfactory, in the Moderate concentration band).
 * In the open-ended Severe band the index cannot be interpolated, so 401 is
 * returned with isLowerBound = true (displayed as "401+").
 */
export function subIndexFor(parameter, concentration) {
  const bp = NAQI_BREAKPOINTS[parameter];
  if (!bp) throw new Error(`Unknown NAQI parameter "${parameter}"`);
  if (typeof concentration !== 'number' || !Number.isFinite(concentration) || concentration < 0) return null;

  const c = roundTo(concentration, bp.decimals);
  if (c > bp.severeAbove) {
    return { subIndex: 401, isLowerBound: true, category: 'Severe', concentrationBand: 'Severe' };
  }
  const bandIndex = bp.bands.findIndex(([lo, hi]) => c >= lo && c <= hi);
  if (bandIndex === -1) return null; // unreachable for rounded, non-negative input
  const [bLo, bHi] = bp.bands[bandIndex];
  const { min: bandMin, max: iHi } = NAQI_CATEGORIES[bandIndex];
  // CUPS/82/2014-15 §3.5: "subtract one from ILO, if ILO is greater than 50".
  const iLo = bandMin > 50 ? bandMin - 1 : bandMin;
  const subIndex = Math.round(((iHi - iLo) / (bHi - bLo)) * (c - bLo) + iLo);
  return {
    subIndex,
    isLowerBound: false,
    category: categoryForIndex(subIndex),
    concentrationBand: NAQI_CATEGORIES[bandIndex].label,
  };
}

/** Round an averaged concentration for display at one decimal beyond the table's precision. */
export function displayAverage(parameter, value) {
  return roundTo(value, NAQI_BREAKPOINTS[parameter].decimals + 1);
}

/**
 * Running mean of hourly values over the `hours` window ending at `referenceTime`
 * (inclusive). Points after the reference time are ignored, so future values never
 * leak into the average. Invalid points (null, non-finite, negative) are skipped.
 */
export function windowAverage(points, referenceTime, hours) {
  const refMs = Date.parse(referenceTime);
  if (Number.isNaN(refMs)) throw new Error(`Invalid reference time "${referenceTime}"`);
  const startMs = refMs - (hours - 1) * HOUR_MS;
  const seen = new Map();
  let invalid = 0;
  for (const p of points || []) {
    const t = Date.parse(p?.time);
    if (Number.isNaN(t) || t < startMs || t > refMs) continue;
    const v = p.value;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
      if (v !== null && v !== undefined) invalid += 1;
      continue;
    }
    seen.set(t, v); // de-duplicate by timestamp (last value wins)
  }
  const values = [...seen.values()];
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  return {
    average,
    validHours: values.length,
    invalidValues: invalid,
    windowHours: hours,
    windowStart: new Date(startMs).toISOString(),
    windowEnd: new Date(refMs).toISOString(),
  };
}

/**
 * Compute the NAQI at `referenceTime`.
 *
 * @param {Record<string, {unit: string, points: {time: string, value: number|null}[]}>} series
 *   Hourly series per pollutant (pm25, pm10, no2, o3, co, so2, nh3, pb), any supported unit.
 * @param {string} referenceTime ISO timestamp (UTC) of the hour the index is computed for.
 * @returns NAQI result with per-pollutant sub-indices. `status` is 'ok' only when the
 *   CPCB minimum requirements are met; otherwise 'insufficient_data' and `value` is null.
 */
export function computeNaqi(series, referenceTime) {
  const subIndices = {};
  for (const parameter of NAQI_PARAMETERS) {
    const input = series?.[parameter];
    if (!input) continue;
    const bp = NAQI_BREAKPOINTS[parameter];
    const required = MIN_VALID_HOURS[bp.averagingHours];
    const points = (input.points || []).map(p => ({
      time: p.time,
      value: typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0
        ? toCpcbUnit(parameter, p.value, input.unit)
        : p.value,
    }));
    const avg = windowAverage(points, referenceTime, bp.averagingHours);
    const base = {
      unit: CPCB_UNITS[parameter],
      averagingHours: bp.averagingHours,
      validHours: avg.validHours,
      requiredHours: required,
      invalidValues: avg.invalidValues,
      windowStart: avg.windowStart,
      windowEnd: avg.windowEnd,
    };
    if (avg.validHours < required) {
      subIndices[parameter] = { ...base, status: 'insufficient_data', average: null, averageRaw: null, subIndex: null, isLowerBound: false, category: null, concentrationBand: null };
      continue;
    }
    const si = subIndexFor(parameter, avg.average);
    subIndices[parameter] = {
      ...base,
      status: 'ok',
      average: displayAverage(parameter, avg.average), // for display
      averageRaw: avg.average, // full precision, for further calculation
      subIndex: si.subIndex,
      isLowerBound: si.isLowerBound,
      category: si.category,
      concentrationBand: si.concentrationBand,
    };
  }
  return aggregateSubIndices(subIndices);
}

/**
 * Aggregate per-pollutant sub-indices into an overall index using the CPCB
 * maximum-operator rule and minimum-pollutant requirement.
 */
export function aggregateSubIndices(subIndices) {
  const valid = Object.entries(subIndices).filter(([, s]) => s.status === 'ok');
  const reasons = [];
  if (valid.length < MIN_POLLUTANTS) {
    reasons.push(`Valid sub-indices for ${valid.length} pollutant(s); CPCB requires at least ${MIN_POLLUTANTS}.`);
  }
  if (!valid.some(([p]) => PARTICULATE_PARAMETERS.includes(p))) {
    reasons.push('No valid PM2.5 or PM10 sub-index; CPCB requires one of them.');
  }
  if (reasons.length) {
    return { status: 'insufficient_data', value: null, isLowerBound: false, category: null, dominantPollutants: [], subIndices, reasons, method: NAQI_METHOD };
  }
  const max = Math.max(...valid.map(([, s]) => s.subIndex));
  const dominantPollutants = valid.filter(([, s]) => s.subIndex === max).map(([p]) => p);
  const isLowerBound = valid.some(([, s]) => s.subIndex === max && s.isLowerBound);
  return {
    status: 'ok',
    value: max,
    isLowerBound,
    category: categoryForIndex(max),
    dominantPollutants,
    subIndices,
    reasons: [],
    method: NAQI_METHOD,
  };
}
