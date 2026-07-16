import { getSeason } from './sourceAttribution.js';
import { getOverallAQI, getAQIFromConcentration, getAQICategory } from '../utils/calculations.js';

export function generateForecast(currentData, cityId) {
  const season = getSeason();
  const hours = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];
  const baseAQI = currentData.aqi || 150;
  const basePM25 = currentData.pm25 || 60;

  const seasonalMultipliers = {
    winter: { amplitude: 0.25, trend: 0.02, variance: 0.15 },
    summer: { amplitude: 0.15, trend: -0.01, variance: 0.10 },
    monsoon: { amplitude: 0.20, trend: -0.03, variance: 0.12 },
  };

  const sm = seasonalMultipliers[season] || seasonalMultipliers.summer;

  const forecast = hours.map((h, i) => {
    const timeOfDay = (new Date().getHours() + h) % 24;
    const diurnalFactor = Math.sin((timeOfDay - 4) * Math.PI / 12) * sm.amplitude;
    const trendFactor = sm.trend * i;
    const noise = (Math.random() - 0.5) * sm.variance;

    let predictedAQI = Math.round(baseAQI * (1 + diurnalFactor + trendFactor + noise));
    predictedAQI = Math.max(0, Math.min(500, predictedAQI));

    let predictedPM25 = Math.round(basePM25 * (1 + diurnalFactor + trendFactor + noise));
    predictedPM25 = Math.max(0, Math.min(500, predictedPM25));

    const category = getAQICategory(predictedAQI);
    const confidence = Math.max(35, 95 - i * 3);

    const alerts = [];
    if (predictedAQI > 300) alerts.push('Health emergency — stay indoors');
    else if (predictedAQI > 200) alerts.push('Avoid prolonged outdoor exposure');
    if (predictedPM25 > 150) alerts.push('High PM2.5 — use air purifiers');
    if (i > 0 && predictedAQI > forecast[i - 1]?.aqi + 30) alerts.push('Rapid deterioration expected');

    return {
      hour: `+${h}h`,
      hoursFromNow: h,
      time: new Date(Date.now() + h * 3600000).toISOString(),
      aqi: predictedAQI,
      pm25: predictedPM25,
      category: category.label,
      color: category.color,
      confidence,
      alerts,
    };
  });

  const peak = forecast.reduce((max, f) => f.aqi > max.aqi ? f : max, forecast[0]);
  const trend = {
    improving: forecast.filter(f => f.aqi < baseAQI).length,
    deteriorating: forecast.filter(f => f.aqi > baseAQI + 20).length,
    stable: forecast.filter(f => Math.abs(f.aqi - baseAQI) <= 20).length,
  };
  const predominantTrend = trend.improving > trend.deteriorating ? 'Improving' :
    trend.deteriorating > trend.improving ? 'Deteriorating' : 'Stable';

  return {
    forecast,
    peak,
    trend: predominantTrend,
    confidence: Math.round(forecast.reduce((s, f) => s + f.confidence, 0) / forecast.length),
    season,
    generatedAt: new Date().toISOString(),
  };
}
