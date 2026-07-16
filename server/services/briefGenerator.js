import { getAQICategory, getHealthAdvisory } from '../utils/calculations.js';
import { cities } from '../data/cities.js';
import { getSeason } from './sourceAttribution.js';

export function generateExecutiveBrief(cityId, currentData, sources, forecast, simulation) {
  const city = cities.find(c => c.id === cityId);
  const category = getAQICategory(currentData.aqi);
  const season = getSeason();
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const brief = {
    title: `Executive Decision Brief — ${city?.name || cityId} Air Quality Management`,
    generatedAt: new Date().toISOString(),
    date,
    classification: 'CONFIDENTIAL — FOR OFFICIAL USE ONLY',
    city: city || { name: cityId, state: 'Unknown' },
    executiveSummary: {
      currentAQI: currentData.aqi,
      category: category.label,
      dominantPollutant: 'PM2.5',
      trend: forecast?.trend || 'Stable',
      season,
      criticality: currentData.aqi > 300 ? 'CRITICAL' : currentData.aqi > 200 ? 'HIGH' : 'MODERATE',
    },
    currentSituation: {
      overview: `${city?.name || cityId} is experiencing ${category.label.toLowerCase()} air quality with an AQI of ${currentData.aqi}. ` +
        `PM2.5 levels at ${currentData.pm25} µg/m³ are ${currentData.pm25 > 60 ? 'significantly above' : 'near'} the safe limit of 60 µg/m³.`,
      keyMetrics: {
        aqi: currentData.aqi,
        pm25: currentData.pm25,
        pm10: currentData.pm10,
        no2: currentData.no2,
        o3: currentData.o3,
        temperature: currentData.temperature,
        humidity: currentData.humidity,
        windSpeed: currentData.windSpeed,
      },
      weatherInfluence: getWeatherInfluence(currentData, season),
    },
    sourceAttribution: {
      topSources: sources?.sortedSources?.slice(0, 3).map(s => ({
        source: s.source,
        percentage: s.percentage,
        confidence: s.confidence,
        description: s.description,
      })) || [],
      keyFinding: `The primary contributor to air pollution in ${city?.name || cityId} is ` +
        `${sources?.sortedSources?.[0]?.source || 'unknown'} (${sources?.sortedSources?.[0]?.percentage || 0}%), ` +
        `followed by ${sources?.sortedSources?.[1]?.source || 'unknown'} (${sources?.sortedSources?.[1]?.percentage || 0}%).`,
    },
    forecast: {
      summary: `Over the next 72 hours, air quality is expected to ${forecast?.trend?.toLowerCase() || 'remain stable'}. ` +
        `Peak AQI of ${forecast?.peak?.aqi || currentData.aqi} is forecast at ${forecast?.peak?.hour || 'current levels'}.`,
      confidence: forecast?.confidence || 70,
      peakAQI: forecast?.peak?.aqi || currentData.aqi,
      trend: forecast?.trend || 'Stable',
    },
    recommendations: generateRecommendations(currentData, sources, season, city),
    expectedOutcomes: {
      withIntervention: simulation ? {
        aqi: simulation.predictedAQI,
        reduction: simulation.aqiReduction,
        improvement: simulation.improvementPercentage,
        pm25: simulation.predictedPM25,
        admissionsAverted: simulation.avertedAdmissions,
        cost: simulation.totalCostCrores,
      } : null,
      withoutIntervention: {
        aqi: forecast?.peak?.aqi || currentData.aqi + 20,
        pm25: currentData.pm25 * 1.1,
        riskLevel: forecast?.trend === 'Deteriorating' ? 'High' : 'Moderate',
      },
    },
    publicAdvisory: getHealthAdvisory(category.label),
    confidenceLevel: 'High',
    methodology: 'Analysis based on real-time monitoring data, AI-powered source attribution, meteorological modeling, and evidence-based policy simulation.',
  };

  return brief;
}

function getWeatherInfluence(data, season) {
  const influences = [];
  if (data.windSpeed < 5) influences.push('Low wind speeds limiting pollutant dispersion');
  if (data.humidity > 70) influences.push('High humidity aiding secondary particle formation');
  if (data.temperature < 15) influences.push('Cold conditions trapping pollutants near surface (inversion)');
  if (season === 'winter') influences.push('Winter inversion layer trapping emissions');
  if (season === 'summer' && data.temperature > 35) influences.push('Heat promoting ozone formation');
  return influences.length > 0 ? influences : ['Neutral meteorological conditions'];
}

function generateRecommendations(data, sources, season, city) {
  const recommendations = [];
  const topSource = sources?.sortedSources?.[0]?.source;

  if (topSource === 'traffic') {
    recommendations.push({
      priority: 'HIGH',
      action: 'Implement vehicular restrictions (odd-even scheme) immediately',
      timeline: '24-48 hours',
      expectedImpact: '15-20% reduction in NO2 and CO',
    });
  }
  if (topSource === 'biomass' || (season === 'winter' && data.pm25 > 100)) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Enforce biomass burning ban with field-level monitoring',
      timeline: 'Immediate',
      expectedImpact: '20-30% reduction in PM2.5',
    });
  }
  if (data.aqi > 200) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Activate emergency response protocol — GRAP Stage III/IV',
      timeline: 'Immediate',
      expectedImpact: 'Prevent further deterioration',
    });
  }
  recommendations.push({
    priority: 'MEDIUM',
    action: `Deploy anti-smog guns at ${city?.name || 'city'} construction hotspots`,
    timeline: '1-2 days',
    expectedImpact: '5-10% reduction in localized PM levels',
  });
  recommendations.push({
    priority: 'MEDIUM',
    action: 'Issue health advisory for sensitive groups — schools, elderly, patients',
    timeline: 'Immediate',
    expectedImpact: 'Reduce public health impact',
  });
  recommendations.push({
    priority: 'LOW',
    action: 'Conduct awareness campaign on air pollution prevention measures',
    timeline: '1 week',
    expectedImpact: 'Long-term behavioral change',
  });

  return recommendations;
}
