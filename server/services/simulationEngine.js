import { getSeason } from './sourceAttribution.js';
import { getAQICategory } from '../utils/calculations.js';

const INTERVENTIONS = {
  construction_ban: {
    name: 'Construction Ban',
    category: 'Regulatory',
    description: 'Temporary halt on all construction and demolition activities',
    cost: 50,
    costUnit: 'Cr ₹/month',
    impact: { dust: 0.6, pm10: 0.35, pm25: 0.2 },
    timeToEffect: '24-48 hours',
    publicSupport: 'Moderate',
  },
  industrial_restriction: {
    name: 'Industrial Restrictions',
    category: 'Regulatory',
    description: 'Reduce industrial operations, enforce emission standards',
    cost: 75,
    costUnit: 'Cr ₹/month',
    impact: { industry: 0.55, so2: 0.5, no2: 0.3 },
    timeToEffect: '48-72 hours',
    publicSupport: 'Low',
  },
  heavy_vehicle_ban: {
    name: 'Heavy Vehicle Diversion',
    category: 'Traffic',
    description: 'Divert heavy trucks and diesel vehicles from city centers',
    cost: 30,
    costUnit: 'Cr ₹/month',
    impact: { traffic: 0.45, no2: 0.4, pm25: 0.15 },
    timeToEffect: '12-24 hours',
    publicSupport: 'High',
  },
  public_transport: {
    name: 'Free Public Transport',
    category: 'Traffic',
    description: 'Subsidized/free public transit to reduce private vehicle use',
    cost: 40,
    costUnit: 'Cr ₹/month',
    impact: { traffic: 0.25, no2: 0.2 },
    timeToEffect: '3-7 days',
    publicSupport: 'Very High',
  },
  dust_suppression: {
    name: 'Dust Suppression',
    category: 'Mitigation',
    description: 'Water sprinkling, road cleaning, anti-smog guns',
    cost: 15,
    costUnit: 'Cr ₹/month',
    impact: { dust: 0.45, pm10: 0.25, pm25: 0.1 },
    timeToEffect: 'Immediate',
    publicSupport: 'High',
  },
  urban_greening: {
    name: 'Urban Greening',
    category: 'Long-term',
    description: 'Plant trees, green walls, rooftop gardens, vertical forests',
    cost: 120,
    costUnit: 'Cr ₹ (one-time)',
    impact: { dust: 0.15, pm25: 0.1, o3: 0.1 },
    timeToEffect: '6-18 months',
    publicSupport: 'Very High',
  },
  odd_even: {
    name: 'Odd-Even Scheme',
    category: 'Traffic',
    description: 'Alternate day vehicle restriction based on license plate',
    cost: 10,
    costUnit: 'Cr ₹/month',
    impact: { traffic: 0.3, no2: 0.25, co: 0.25, pm25: 0.12 },
    timeToEffect: '24 hours',
    publicSupport: 'Moderate',
  },
  biomass_ban: {
    name: 'Biomass Burning Ban',
    category: 'Regulatory',
    description: 'Ban on crop residue burning with enforcement and alternatives',
    cost: 60,
    costUnit: 'Cr ₹/season',
    impact: { biomass: 0.7, pm25: 0.25, co: 0.2 },
    timeToEffect: '1-2 weeks',
    publicSupport: 'Moderate',
  },
};

const HEALTH_IMPACT_RATES = {
  pm25: { admissionRate: 0.012, mortalityRate: 0.003 },
  pm10: { admissionRate: 0.008, mortalityRate: 0.002 },
};

export function runSimulation(currentData, selectedInterventions) {
  const season = getSeason();
  const baseAQI = currentData.aqi || 150;

  // Parse population: accept either numeric or string like "32M", "10L", etc.
  let population = 5000000; // default
  if (typeof currentData.population === 'number' && currentData.population > 0) {
    population = currentData.population;
  } else if (typeof currentData.population === 'string') {
    const str = currentData.population.replace(/[^0-9.kmKMcClL]/g, '');
    if (str.endsWith('M') || str.endsWith('m')) {
      population = parseFloat(str) * 1000000;
    } else if (str.endsWith('Cr') || str.endsWith('cr') || str.endsWith('CR')) {
      population = parseFloat(str) * 10000000;
    } else if (str.endsWith('L') || str.endsWith('l')) {
      population = parseFloat(str) * 100000;
    } else {
      population = parseInt(str) || 5000000;
    }
  }

  const appliedInterventions = selectedInterventions.map(id => {
    const iv = INTERVENTIONS[id];
    if (!iv) return null;
    const combinedImpact = {};
    for (const [target, reduction] of Object.entries(iv.impact)) {
      combinedImpact[target] = reduction;
    }
    return { ...iv, id, combinedImpact };
  }).filter(Boolean);

  const totalImpact = {};
  for (const iv of appliedInterventions) {
    for (const [target, reduction] of Object.entries(iv.combinedImpact)) {
      totalImpact[target] = Math.min(1, (totalImpact[target] || 0) + reduction);
    }
  }

  const pollutionReduction = Object.values(totalImpact).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(totalImpact).length);
  const aqiReduction = Math.round(baseAQI * pollutionReduction * 0.8);
  const predictedAQI = Math.max(0, baseAQI - aqiReduction);
  const pm25Reduction = Math.round((currentData.pm25 || 60) * pollutionReduction * 0.6);
  const predictedPM25 = Math.max(0, (currentData.pm25 || 60) - pm25Reduction);

  const baseAdmissions = Math.round(population * HEALTH_IMPACT_RATES.pm25.admissionRate * (baseAQI / 200));
  const predictedAdmissions = Math.round(baseAdmissions * (1 - pollutionReduction * 0.7));
  const avertedAdmissions = baseAdmissions - predictedAdmissions;

  const baseExposure = population;
  const exposedReduction = Math.round(pollutionReduction * 60);
  const exposedPopulation = Math.round(baseExposure * (100 - exposedReduction) / 100);

  const totalCost = appliedInterventions.reduce((s, iv) => s + ((iv.cost || 0) * 10000000), 0);
  const totalCostCrores = totalCost / 10000000;

  const effectiveness = {
    aqiImprovement: Math.round(pollutionReduction * 100),
    pm25Reduction: Math.round(pollutionReduction * 60),
    healthImpact: Math.round(pollutionReduction * 50),
    feasibility: Math.round((5 - appliedInterventions.filter(iv => iv.publicSupport === 'Low').length) * 20),
  };

  return {
    baselineAQI: baseAQI,
    predictedAQI,
    aqiReduction,
    baselinePM25: currentData.pm25 || 60,
    predictedPM25,
    pm25Reduction,
    baselineAdmissions: baseAdmissions,
    predictedAdmissions,
    avertedAdmissions,
    population,
    exposedPopulation,
    totalCostCrores,
    effectiveness,
    interventions: appliedInterventions,
    category: getAQICategory(predictedAQI),
    improvementPercentage: Math.round((1 - predictedAQI / baseAQI) * 100),
  };
}

export function getInterventions() {
  return Object.entries(INTERVENTIONS).map(([id, iv]) => ({ id, ...iv }));
}
