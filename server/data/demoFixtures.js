// DEMO FIXTURES — illustrative values only.
//
// These are hand-written placeholder numbers, NOT measurements or model output.
// They are used only when the server runs with DATA_MODE=demo, and every response
// built from them is labelled `kind: 'demo'` so the UI shows a DEMO banner.
// Concentrations are in µg/m³ (including CO).

export const DEMO_SOURCE = {
  provider: 'demo-fixture',
  model: 'Static demo fixture (not real data)',
  kind: 'demo',
  attribution: 'DEMO DATA — illustrative values, not measurements',
  url: null,
};

export const demoFixtures = {
  delhi: { pm25: 198, pm10: 342, no2: 78, o3: 45, so2: 22, co: 1800, temperature: 28, humidity: 62, windSpeed: 8, windDirection: 'NW', pressure: 1012, visibility: 3.5 },
  mumbai: { pm25: 68, pm10: 128, no2: 42, o3: 38, so2: 12, co: 900, temperature: 30, humidity: 78, windSpeed: 14, windDirection: 'SW', pressure: 1008, visibility: 6.0 },
  bengaluru: { pm25: 42, pm10: 85, no2: 32, o3: 28, so2: 8, co: 600, temperature: 26, humidity: 55, windSpeed: 12, windDirection: 'E', pressure: 1015, visibility: 8.0 },
  kolkata: { pm25: 112, pm10: 208, no2: 56, o3: 32, so2: 18, co: 1200, temperature: 29, humidity: 72, windSpeed: 10, windDirection: 'S', pressure: 1010, visibility: 4.5 },
  chennai: { pm25: 32, pm10: 68, no2: 28, o3: 22, so2: 6, co: 500, temperature: 31, humidity: 70, windSpeed: 16, windDirection: 'SE', pressure: 1011, visibility: 9.0 },
  hyderabad: { pm25: 38, pm10: 78, no2: 30, o3: 26, so2: 7, co: 500, temperature: 27, humidity: 52, windSpeed: 11, windDirection: 'W', pressure: 1014, visibility: 7.5 },
  pune: { pm25: 52, pm10: 102, no2: 36, o3: 30, so2: 10, co: 800, temperature: 28, humidity: 58, windSpeed: 13, windDirection: 'NW', pressure: 1013, visibility: 6.5 },
  lucknow: { pm25: 148, pm10: 265, no2: 62, o3: 38, so2: 16, co: 1400, temperature: 27, humidity: 65, windSpeed: 6, windDirection: 'NW', pressure: 1011, visibility: 3.0 },
  ahmedabad: { pm25: 58, pm10: 115, no2: 38, o3: 32, so2: 11, co: 700, temperature: 32, humidity: 48, windSpeed: 15, windDirection: 'W', pressure: 1009, visibility: 5.5 },
  patna: { pm25: 172, pm10: 305, no2: 68, o3: 40, so2: 20, co: 1600, temperature: 28, humidity: 60, windSpeed: 7, windDirection: 'E', pressure: 1010, visibility: 2.8 },
};

const POLLUTANTS = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'];
const HOUR_MS = 3600_000;

/**
 * Deterministic demo series with the same shape as the live provider:
 * constant hourly values from 48 h before to 96 h after the current UTC hour.
 */
export function demoAirQualitySeries(cityId, now = new Date()) {
  const f = demoFixtures[cityId];
  if (!f) return null;
  const currentHour = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;
  const times = [];
  for (let h = -48; h < 96; h++) times.push(new Date(currentHour + h * HOUR_MS).toISOString());
  const series = Object.fromEntries(POLLUTANTS.map(p => [p, times.map(() => f[p])]));
  return { source: DEMO_SOURCE, retrievedAt: now.toISOString(), unit: 'ug/m3', times, series };
}

export function demoWeather(cityId, now = new Date()) {
  const f = demoFixtures[cityId];
  if (!f) return null;
  return {
    source: DEMO_SOURCE,
    retrievedAt: now.toISOString(),
    observedAt: null,
    temperature: f.temperature,
    humidity: f.humidity,
    windSpeed: f.windSpeed,
    windDirection: f.windDirection,
    pressure: f.pressure,
    visibility: f.visibility,
  };
}
