// Builders for Open-Meteo-shaped test responses. Values are synthetic test inputs,
// chosen so expected NAQI results can be computed by hand.

const HOUR_MS = 3600_000;

const VARIABLES = ['pm2_5', 'pm10', 'nitrogen_dioxide', 'ozone', 'sulphur_dioxide', 'carbon_monoxide'];

/** Open-Meteo time format with timezone=GMT: "YYYY-MM-DDTHH:00". */
const fmt = ms => new Date(ms).toISOString().slice(0, 16);

/**
 * Hourly air-quality response from 48 h before to 96 h after the current UTC hour.
 * `values[variable]` is a number, null, or (hoursFromNow) => number|null.
 */
export function airQualityResponse(values, { now = Date.now(), units = {}, omit = [] } = {}) {
  const currentHour = Math.floor(now / HOUR_MS) * HOUR_MS;
  const offsets = [];
  for (let h = -48; h < 96; h++) offsets.push(h);
  const hourly = { time: offsets.map(h => fmt(currentHour + h * HOUR_MS)) };
  const hourlyUnits = { time: 'iso8601' };
  for (const v of VARIABLES) {
    if (omit.includes(v)) continue;
    const spec = values[v];
    hourly[v] = offsets.map(h => (typeof spec === 'function' ? spec(h) : spec ?? null));
    hourlyUnits[v] = units[v] ?? 'μg/m³';
  }
  return { latitude: 28.6, longitude: 77.2, timezone: 'GMT', hourly_units: hourlyUnits, hourly };
}

export const DELHI_CAMS_SAMPLE = {
  // CAMS values returned by Open-Meteo for Delhi on 11 Oct 2026 (audit run).
  pm2_5: 63.3, pm10: 152.3, nitrogen_dioxide: 29.2, ozone: 101, sulphur_dioxide: 32.9, carbon_monoxide: 547,
};

export function weatherResponse(overrides = {}, { now = Date.now() } = {}) {
  const currentHour = Math.floor(now / HOUR_MS) * HOUR_MS;
  return {
    current: {
      time: fmt(currentHour),
      temperature_2m: 24.9,
      relative_humidity_2m: 77,
      wind_speed_10m: 10,
      wind_direction_10m: 67,
      surface_pressure: 990.8,
      visibility: 7360,
      ...overrides,
    },
  };
}

/** Route stubbed upstream URLs to air-quality or weather handlers. */
export function routeOpenMeteo({ airQuality, weather }) {
  return (url, init) => {
    if (url.startsWith('https://air-quality-api.open-meteo.com/')) return airQuality(url, init);
    if (url.startsWith('https://api.open-meteo.com/')) return weather(url, init);
    throw new Error(`unexpected upstream URL ${url}`);
  };
}
