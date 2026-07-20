// Multi-factor Source Contribution Analysis Engine
// Estimates pollution source contributions using environmental indicators

const SOURCE_PROFILES = {
  traffic: {
    indicators: ['no2', 'co', 'pm25'],
    weight: 0.85,
    description: 'Vehicular emissions from petrol/diesel engines',
    mitigation: 'Implement odd-even schemes, promote EV adoption, improve public transit',
    seasonalFactor: { winter: 1.1, summer: 0.9, monsoon: 0.85 },
  },
  industry: {
    indicators: ['so2', 'pm10', 'no2'],
    weight: 0.8,
    description: 'Industrial processes, manufacturing, and power plants',
    mitigation: 'Enforce emission standards, shift to cleaner fuels, install scrubbers',
    seasonalFactor: { winter: 1.05, summer: 1.0, monsoon: 0.9 },
  },
  biomass: {
    indicators: ['pm25', 'co', 'o3'],
    weight: 0.75,
    description: 'Crop residue burning, wood stoves, waste incineration',
    mitigation: 'Promote stubble management, provide alternatives to burning',
    seasonalFactor: { winter: 1.4, summer: 0.7, monsoon: 0.5 },
  },
  dust: {
    indicators: ['pm10', 'pm25'],
    weight: 0.7,
    description: 'Construction dust, road dust, soil erosion',
    mitigation: 'Water sprinkling, road paving, construction site covers',
    seasonalFactor: { winter: 0.8, summer: 1.3, monsoon: 0.6 },
  },
  others: {
    indicators: ['o3'],
    weight: 0.5,
    description: 'Secondary pollutants, long-range transport, natural sources',
    mitigation: 'Regional cooperation, VOC controls, monitoring networks',
    seasonalFactor: { winter: 0.9, summer: 1.1, monsoon: 1.0 },
  },
};

export function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return 'summer';
  if (month >= 6 && month <= 9) return 'monsoon';
  return 'winter';
}

export function calculateSourceAttribution(data) {
  const season = getSeason();
  const readings = {
    no2: data.no2 || 0,
    co: data.co || 0,
    pm25: data.pm25 || 0,
    pm10: data.pm10 || 0,
    so2: data.so2 || 0,
    o3: data.o3 || 0,
  };

  const maxVal = Math.max(...Object.values(readings), 1);
  const rawScores = {};

  for (const [source, profile] of Object.entries(SOURCE_PROFILES)) {
    const sf = profile.seasonalFactor[season] || 1;
    let score = 0;
    for (const indicator of profile.indicators) {
      const normalized = readings[indicator] / maxVal;
      score += normalized * profile.weight;
    }
    score = (score / profile.indicators.length) * sf;
    rawScores[source] = Math.max(0, Math.min(100, score * 100));
  }

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const contributions = {};
  const confidenceScores = {};

  for (const [source, score] of Object.entries(rawScores)) {
    contributions[source] = Math.round((score / total) * 100);
    const dataConfidence = Math.min(100, Math.round(
      (SOURCE_PROFILES[source].indicators
        .filter(ind => readings[ind] > 10).length / SOURCE_PROFILES[source].indicators.length) * 100
    ));
    confidenceScores[source] = Math.max(40, dataConfidence);
  }

  const sortedSources = Object.entries(contributions)
    .sort(([, a], [, b]) => b - a);

  return {
    contributions,
    confidenceScores,
    sortedSources: sortedSources.map(([source, pct]) => ({
      source,
      percentage: pct,
      confidence: confidenceScores[source],
      description: SOURCE_PROFILES[source].description,
      mitigation: SOURCE_PROFILES[source].mitigation,
    })),
    season,
    methodology: 'The attribution engine uses a multi-factor analysis combining pollutant concentrations, seasonal patterns, and source-specific emission profiles to estimate contributions.',
  };
}
