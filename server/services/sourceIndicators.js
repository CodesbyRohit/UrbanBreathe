// Source context without source apportionment.
//
// The previous engine produced percentage "contributions" and "confidence"
// scores from a weighted sum of pollutant concentrations in mixed units. That is
// not a valid apportionment method. Real apportionment needs chemically
// speciated measurements and receptor or dispersion modelling, which this
// project does not have. This module therefore reports descriptive indicators
// only, and lists common urban source categories without quantifying them.

import { getIndiaSeason } from '../domain/season.js';
import { provenanceOf } from './cityAirQuality.js';

export const SOURCE_DISCLAIMER =
  'UrbanBreathe does not estimate how much each source contributes. Source apportionment requires chemically speciated measurements and receptor or dispersion modelling, which are not available here. The indicators below are descriptive context only and must not be read as source attribution.';

export const SOURCE_CATEGORIES = [
  { source: 'traffic', description: 'Vehicular emissions from petrol/diesel engines', mitigation: 'Traffic management, cleaner vehicles and fuels, public transport' },
  { source: 'industry', description: 'Industrial processes, manufacturing and power plants', mitigation: 'Enforcement of emission standards, cleaner fuels, control equipment' },
  { source: 'biomass', description: 'Crop residue burning, solid-fuel use and waste burning', mitigation: 'Residue management alternatives, enforcement against open burning' },
  { source: 'dust', description: 'Construction, road and soil dust', mitigation: 'Dust control at construction sites, road cleaning and paving' },
  { source: 'others', description: 'Secondary pollutants, regional transport and natural sources', mitigation: 'Regional coordination and precursor controls' },
];

const round2 = v => Math.round(v * 100) / 100;

function okAverage(ctx, parameter) {
  const s = ctx.naqi.subIndices[parameter];
  return s && s.status === 'ok' ? s.average : null;
}

export function buildSourceContext(ctx) {
  const pm25 = okAverage(ctx, 'pm25');
  const pm10 = okAverage(ctx, 'pm10');
  const ratio = pm25 !== null && pm10 !== null && pm10 > 0 ? round2(pm25 / pm10) : null;
  const basis = ctx.aq.source.kind;

  return {
    cityId: ctx.city.id,
    status: 'indicators_only',
    disclaimer: SOURCE_DISCLAIMER,
    indicators: [
      {
        id: 'pm25_pm10_ratio',
        label: 'PM2.5 / PM10 ratio (24-hour means)',
        value: ratio,
        inputs: { pm25: pm25, pm10: pm10, unit: 'µg/m³' },
        basis,
        explanation: 'The share of PM10 mass in the fine (PM2.5) fraction. Combustion-related particles tend to be fine; mechanically generated dust tends to be coarse.',
        caveat: 'Computed from modelled data, so it reflects the model\'s particle composition. It does not identify or quantify any source.',
        unavailableReason: ratio === null ? 'Valid 24-hour PM2.5 and PM10 means are both required.' : null,
      },
      {
        id: 'dominant_pollutant',
        label: 'Dominant pollutant in the NAQI-method estimate',
        value: ctx.naqi.dominantPollutants.length ? ctx.naqi.dominantPollutants : null,
        basis,
        explanation: 'The pollutant with the highest CPCB sub-index.',
        caveat: 'A dominant pollutant is not a source; several sources can emit the same pollutant.',
        unavailableReason: ctx.naqi.status !== 'ok' ? 'The NAQI-method estimate is unavailable (insufficient data).' : null,
      },
    ],
    sourceCategories: SOURCE_CATEGORIES,
    season: getIndiaSeason(ctx.now, ctx.city.timezone),
    provenance: provenanceOf(ctx),
    generatedAt: ctx.now.toISOString(),
  };
}
