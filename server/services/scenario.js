// Illustrative intervention scenarios.
//
// The previous simulator reported hospital admissions averted, exposed
// population, implementation costs and "effectiveness" scores from made-up
// coefficients (e.g. admissions = population × 0.012 × AQI / 200, with a 5M
// population default for every city). Those outputs are removed.
//
// What remains is transparent arithmetic: uncited placeholder reduction
// fractions are applied to the city's current modelled 24-hour / 8-hour mean
// concentrations and the NAQI method is re-applied. It is not a prediction.

import { subIndexFor, aggregateSubIndices } from '../domain/naqi.js';
import { provenanceOf, NAQI_LABELS } from './cityAirQuality.js';

// Reduction fractions are the original project's placeholder values, kept so the
// tool remains usable, and labelled everywhere as uncited and unvalidated.
const INTERVENTIONS = {
  construction_ban: {
    name: 'Construction Ban', category: 'Regulatory',
    description: 'Temporary halt on construction and demolition activities',
    assumedReduction: { pm10: 0.35, pm25: 0.2 },
  },
  industrial_restriction: {
    name: 'Industrial Restrictions', category: 'Regulatory',
    description: 'Reduce industrial operations, enforce emission standards',
    assumedReduction: { so2: 0.5, no2: 0.3 },
  },
  heavy_vehicle_ban: {
    name: 'Heavy Vehicle Diversion', category: 'Traffic',
    description: 'Divert heavy trucks and diesel vehicles from city centres',
    assumedReduction: { no2: 0.4, pm25: 0.15 },
  },
  public_transport: {
    name: 'Free Public Transport', category: 'Traffic',
    description: 'Subsidised or free public transit to reduce private vehicle use',
    assumedReduction: { no2: 0.2 },
  },
  dust_suppression: {
    name: 'Dust Suppression', category: 'Mitigation',
    description: 'Water sprinkling, road cleaning, anti-smog guns',
    assumedReduction: { pm10: 0.25, pm25: 0.1 },
  },
  urban_greening: {
    name: 'Urban Greening', category: 'Long-term',
    description: 'Trees, green walls and rooftop gardens',
    assumedReduction: { pm25: 0.1, o3: 0.1 },
  },
  odd_even: {
    name: 'Odd-Even Scheme', category: 'Traffic',
    description: 'Alternate-day vehicle restriction based on licence plate',
    assumedReduction: { no2: 0.25, co: 0.25, pm25: 0.12 },
  },
  biomass_ban: {
    name: 'Biomass Burning Ban', category: 'Regulatory',
    description: 'Ban on crop residue burning with enforcement and alternatives',
    assumedReduction: { pm25: 0.25, co: 0.2 },
  },
};

export const ASSUMPTION_NOTE =
  'Reduction fractions are uncited placeholder assumptions. They have not been validated for any city.';

export const SCENARIO_DISCLAIMER =
  'Illustrative arithmetic only — not a prediction. Placeholder reduction fractions are applied uniformly to modelled mean concentrations; real outcomes depend on compliance, meteorology, regional transport and source mix. No health, exposure or cost estimates are made.';

export function getInterventions() {
  return Object.entries(INTERVENTIONS).map(([id, iv]) => ({ id, ...iv, assumptionNote: ASSUMPTION_NOTE }));
}

export const INTERVENTION_IDS = Object.keys(INTERVENTIONS);

/** Combine independent fractional reductions: 1 - Π(1 - r). Never exceeds 1. */
export function combineReductions(ids) {
  const remaining = {};
  for (const id of ids) {
    for (const [p, r] of Object.entries(INTERVENTIONS[id].assumedReduction)) {
      remaining[p] = (remaining[p] ?? 1) * (1 - r);
    }
  }
  return Object.fromEntries(Object.entries(remaining).map(([p, rem]) => [p, Math.round((1 - rem) * 1000) / 1000]));
}

export function runScenario(ctx, ids) {
  const reductions = combineReductions(ids);
  const scenarioSubIndices = {};
  for (const [p, s] of Object.entries(ctx.naqi.subIndices)) {
    if (s.status !== 'ok') {
      scenarioSubIndices[p] = { ...s };
      continue;
    }
    const average = s.averageRaw * (1 - (reductions[p] ?? 0));
    const si = subIndexFor(p, average);
    scenarioSubIndices[p] = { ...s, average: Math.round(average * 100) / 100, averageRaw: average, subIndex: si.subIndex, isLowerBound: si.isLowerBound, category: si.category };
  }
  const scenarioNaqi = aggregateSubIndices(scenarioSubIndices);
  const baseline = ctx.naqi;
  const pm25 = baseline.subIndices.pm25;

  return {
    cityId: ctx.city.id,
    kind: 'illustrative-scenario',
    disclaimer: SCENARIO_DISCLAIMER,
    naqiLabel: NAQI_LABELS[ctx.aq.source.kind],
    status: baseline.status,
    reasons: baseline.reasons,
    baselineAQI: baseline.value,
    baselineAQIIsLowerBound: baseline.isLowerBound,
    baselineCategory: baseline.category,
    scenarioAQI: scenarioNaqi.value,
    scenarioAQIIsLowerBound: scenarioNaqi.isLowerBound,
    scenarioCategory: scenarioNaqi.category,
    aqiChange: baseline.value !== null && scenarioNaqi.value !== null && !baseline.isLowerBound && !scenarioNaqi.isLowerBound
      ? scenarioNaqi.value - baseline.value
      : null,
    baselinePM25: pm25?.status === 'ok' ? pm25.average : null,
    scenarioPM25: scenarioSubIndices.pm25?.status === 'ok' ? scenarioSubIndices.pm25.average : null,
    combinedReductions: reductions,
    combinationRule: 'Reductions on the same pollutant are combined as 1 − Π(1 − r).',
    interventions: ids.map(id => ({ id, ...INTERVENTIONS[id] })),
    assumptionNote: ASSUMPTION_NOTE,
    provenance: provenanceOf(ctx),
    generatedAt: ctx.now.toISOString(),
  };
}
