// AQI breakpoints and category definitions (Indian CPCB + US EPA standards)
export const AQI_BREAKPOINTS = {
  PM25: [
    { low: 0, high: 30, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { low: 31, high: 60, aqiLow: 51, aqiHigh: 100, category: 'Satisfactory' },
    { low: 61, high: 90, aqiLow: 101, aqiHigh: 200, category: 'Moderate' },
    { low: 91, high: 120, aqiLow: 201, aqiHigh: 300, category: 'Poor' },
    { low: 121, high: 250, aqiLow: 301, aqiHigh: 400, category: 'Very Poor' },
    { low: 251, high: 500, aqiLow: 401, aqiHigh: 500, category: 'Severe' },
  ],
  PM10: [
    { low: 0, high: 50, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { low: 51, high: 100, aqiLow: 51, aqiHigh: 100, category: 'Satisfactory' },
    { low: 101, high: 250, aqiLow: 101, aqiHigh: 200, category: 'Moderate' },
    { low: 251, high: 350, aqiLow: 201, aqiHigh: 300, category: 'Poor' },
    { low: 351, high: 430, aqiLow: 301, aqiHigh: 400, category: 'Very Poor' },
    { low: 431, high: 600, aqiLow: 401, aqiHigh: 500, category: 'Severe' },
  ],
  NO2: [
    { low: 0, high: 40, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { low: 41, high: 80, aqiLow: 51, aqiHigh: 100, category: 'Satisfactory' },
    { low: 81, high: 180, aqiLow: 101, aqiHigh: 200, category: 'Moderate' },
    { low: 181, high: 280, aqiLow: 201, aqiHigh: 300, category: 'Poor' },
    { low: 281, high: 400, aqiLow: 301, aqiHigh: 400, category: 'Very Poor' },
    { low: 401, high: 600, aqiLow: 401, aqiHigh: 500, category: 'Severe' },
  ],
  O3: [
    { low: 0, high: 50, aqiLow: 0, aqiHigh: 50, category: 'Good' },
    { low: 51, high: 100, aqiLow: 51, aqiHigh: 100, category: 'Satisfactory' },
    { low: 101, high: 168, aqiLow: 101, aqiHigh: 200, category: 'Moderate' },
    { low: 169, high: 208, aqiLow: 201, aqiHigh: 300, category: 'Poor' },
    { low: 209, high: 748, aqiLow: 301, aqiHigh: 400, category: 'Very Poor' },
    { low: 749, high: 1000, aqiLow: 401, aqiHigh: 500, category: 'Severe' },
  ],
};

export const AQI_CATEGORIES = [
  { min: 0, max: 50, label: 'Good', color: '#16a34a', bg: '#dcfce7' },
  { min: 51, max: 100, label: 'Satisfactory', color: '#65a30d', bg: '#ecfccb' },
  { min: 101, max: 200, label: 'Moderate', color: '#eab308', bg: '#fef9c3' },
  { min: 201, max: 300, label: 'Poor', color: '#f97316', bg: '#ffedd5' },
  { min: 301, max: 400, label: 'Very Poor', color: '#ef4444', bg: '#fee2e2' },
  { min: 401, max: 500, label: 'Severe', color: '#7c3aed', bg: '#f3e8ff' },
];

export function getAQIFromConcentration(pollutant, concentration) {
  const breakpoints = AQI_BREAKPOINTS[pollutant];
  if (!breakpoints) return null;
  const bp = breakpoints.find(b => concentration >= b.low && concentration <= b.high);
  if (!bp) return concentration > breakpoints[breakpoints.length - 1].high ? 500 : 0;
  return Math.round(
    ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (concentration - bp.low) + bp.aqiLow
  );
}

export function getAQICategory(aqi) {
  return AQI_CATEGORIES.find(c => aqi >= c.min && aqi <= c.max) || AQI_CATEGORIES[5];
}

export function getOverallAQI(pm25, pm10, no2, o3) {
  const indices = [
    getAQIFromConcentration('PM25', pm25),
    getAQIFromConcentration('PM10', pm10),
    getAQIFromConcentration('NO2', no2),
    getAQIFromConcentration('O3', o3),
  ].filter(Boolean);
  return Math.max(...indices, 0);
}

export function getHealthAdvisory(category) {
  const advisories = {
    Good: 'Air quality is satisfactory. No precautions needed.',
    Satisfactory: 'Air quality is acceptable. Sensitive individuals should monitor symptoms.',
    Moderate: 'Reduce prolonged outdoor exertion. Close windows during peak hours.',
    Poor: 'Avoid prolonged outdoor activity. Wear N95 masks outdoors. Use air purifiers indoors.',
    'Very Poor': 'Avoid all outdoor physical activity. Keep windows sealed. Run air purifiers at max.',
    Severe: 'Health emergency. Stay indoors. Use HEPA purifiers. Seek medical help if symptoms appear.',
  };
  return advisories[category] || advisories.Moderate;
}
