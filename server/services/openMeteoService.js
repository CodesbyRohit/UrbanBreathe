import { fallbackData } from '../data/fallbackData.js';
import { getOverallAQI, getAQIFromConcentration } from '../utils/calculations.js';

const OPEN_METEO_AQ = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_WEATHER = 'https://api.open-meteo.com/v1/forecast';

export async function fetchAirQuality(cityId, lat, lon) {
  try {
    const url = `${OPEN_METEO_AQ}?latitude=${lat}&longitude=${lon}` +
      `&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide` +
      `&hourly=pm2_5,pm10&timezone=auto&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
    const data = await res.json();
    const current = data.current;
    const pm25 = current.pm2_5 || 0;
    const pm10 = current.pm10 || 0;
    const no2 = current.nitrogen_dioxide || 0;
    const o3 = current.ozone || 0;
    const so2 = current.sulphur_dioxide || 0;
    const co = current.carbon_monoxide || 0;
    const aqi = getOverallAQI(pm25 * 2, pm10 * 1.5, no2 * 3, o3 * 2);
    return { pm25, pm10, no2, o3, so2, co, aqi, source: 'open-meteo' };
  } catch (err) {
    console.warn(`Open-Meteo AQ fetch failed for ${cityId}:`, err.message);
    return null;
  }
}

export async function fetchWeather(lat, lon) {
  try {
    const url = `${OPEN_METEO_WEATHER}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility` +
      `&timezone=auto&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo weather returned ${res.status}`);
    const data = await res.json();
    const c = data.current;
    return {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      windDirection: degreesToCompass(c.wind_direction_10m),
      pressure: c.surface_pressure,
      visibility: (c.visibility || 10000) / 1000,
      source: 'open-meteo',
    };
  } catch (err) {
    console.warn(`Open-Meteo weather fetch failed:`, err.message);
    return null;
  }
}

export async function fetchForecast(lat, lon) {
  try {
    const url = `${OPEN_METEO_WEATHER}?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m` +
      `&timezone=auto&forecast_hours=72`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Forecast returned ${res.status}`);
    const data = await res.json();
    const hourly = data.hourly;
    const forecast = [];
    for (let i = 0; i < Math.min(72, hourly.time.length); i += 6) {
      const idx = Math.min(i, hourly.time.length - 1);
      forecast.push({
        hour: `+${i}h`,
        time: hourly.time[idx],
        temperature: hourly.temperature_2m[idx],
        humidity: hourly.relative_humidity_2m[idx],
        windSpeed: hourly.wind_speed_10m[idx],
      });
    }
    return { forecast, source: 'open-meteo' };
  } catch (err) {
    console.warn(`Forecast fetch failed:`, err.message);
    return null;
  }
}

export function getFallbackData(cityId) {
  return fallbackData[cityId] || fallbackData.delhi;
}

function degreesToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return dirs[index];
}

export async function getCombinedCityData(cityId, lat, lon) {
  const [aqResult, weatherResult] = await Promise.allSettled([
    fetchAirQuality(cityId, lat, lon),
    fetchWeather(lat, lon),
  ]);
  const fallback = getFallbackData(cityId);
  const aq = aqResult.status === 'fulfilled' && aqResult.value ? aqResult.value : null;
  const weather = weatherResult.status === 'fulfilled' && weatherResult.value ? weatherResult.value : null;
  return {
    aqi: aq?.aqi ?? fallback.pm25 ? getOverallAQI(fallback.pm25, fallback.pm10, fallback.no2, fallback.o3) : 150,
    pm25: aq?.pm25 ?? fallback.pm25,
    pm10: aq?.pm10 ?? fallback.pm10,
    no2: aq?.no2 ?? fallback.no2,
    o3: aq?.o3 ?? fallback.o3,
    so2: aq?.so2 ?? fallback.so2,
    co: aq?.co ?? fallback.co,
    temperature: weather?.temperature ?? fallback.temperature,
    humidity: weather?.humidity ?? fallback.humidity,
    windSpeed: weather?.windSpeed ?? fallback.windSpeed,
    windDirection: weather?.windDirection ?? fallback.windDir,
    pressure: weather?.pressure ?? fallback.pressure,
    visibility: weather?.visibility ?? fallback.visibility,
    dataSource: aq?.source || weather?.source || 'fallback',
  };
}
