export const fallbackData = {
  delhi: {
    pm25: 198, pm10: 342, no2: 78, o3: 45, so2: 22, co: 1.8,
    temperature: 28, humidity: 62, windSpeed: 8, windDir: 'NW',
    pressure: 1012, visibility: 3.5,
    sources: { traffic: 28, industry: 18, biomass: 22, dust: 20, others: 12 },
    forecast: [
      { hour: '+24', aqi: 310, pm25: 185, condition: 'Stable' },
      { hour: '+48', aqi: 290, pm25: 170, condition: 'Improving' },
      { hour: '+72', aqi: 335, pm25: 200, condition: 'Deteriorating' },
    ],
  },
  mumbai: {
    pm25: 68, pm10: 128, no2: 42, o3: 38, so2: 12, co: 0.9,
    temperature: 30, humidity: 78, windSpeed: 14, windDir: 'SW',
    pressure: 1008, visibility: 6.0,
    sources: { traffic: 35, industry: 15, biomass: 8, dust: 25, others: 17 },
    forecast: [
      { hour: '+24', aqi: 140, pm25: 62, condition: 'Stable' },
      { hour: '+48', aqi: 155, pm25: 72, condition: 'Slight Deterioration' },
      { hour: '+72', aqi: 130, pm25: 58, condition: 'Improving' },
    ],
  },
  bengaluru: {
    pm25: 42, pm10: 85, no2: 32, o3: 28, so2: 8, co: 0.6,
    temperature: 26, humidity: 55, windSpeed: 12, windDir: 'E',
    pressure: 1015, visibility: 8.0,
    sources: { traffic: 40, industry: 12, biomass: 5, dust: 28, others: 15 },
    forecast: [
      { hour: '+24', aqi: 85, pm25: 40, condition: 'Stable' },
      { hour: '+48', aqi: 78, pm25: 36, condition: 'Improving' },
      { hour: '+72', aqi: 92, pm25: 45, condition: 'Slight Deterioration' },
    ],
  },
  kolkata: {
    pm25: 112, pm10: 208, no2: 56, o3: 32, so2: 18, co: 1.2,
    temperature: 29, humidity: 72, windSpeed: 10, windDir: 'S',
    pressure: 1010, visibility: 4.5,
    sources: { traffic: 25, industry: 28, biomass: 18, dust: 18, others: 11 },
    forecast: [
      { hour: '+24', aqi: 190, pm25: 108, condition: 'Stable' },
      { hour: '+48', aqi: 175, pm25: 98, condition: 'Improving' },
      { hour: '+72', aqi: 210, pm25: 120, condition: 'Deteriorating' },
    ],
  },
  chennai: {
    pm25: 32, pm10: 68, no2: 28, o3: 22, so2: 6, co: 0.5,
    temperature: 31, humidity: 70, windSpeed: 16, windDir: 'SE',
    pressure: 1011, visibility: 9.0,
    sources: { traffic: 30, industry: 10, biomass: 8, dust: 32, others: 20 },
    forecast: [
      { hour: '+24', aqi: 70, pm25: 30, condition: 'Stable' },
      { hour: '+48', aqi: 65, pm25: 28, condition: 'Improving' },
      { hour: '+72', aqi: 75, pm25: 34, condition: 'Stable' },
    ],
  },
  hyderabad: {
    pm25: 38, pm10: 78, no2: 30, o3: 26, so2: 7, co: 0.5,
    temperature: 27, humidity: 52, windSpeed: 11, windDir: 'W',
    pressure: 1014, visibility: 7.5,
    sources: { traffic: 32, industry: 18, biomass: 6, dust: 30, others: 14 },
    forecast: [
      { hour: '+24', aqi: 80, pm25: 36, condition: 'Stable' },
      { hour: '+48', aqi: 85, pm25: 40, condition: 'Slight Deterioration' },
      { hour: '+72', aqi: 76, pm25: 34, condition: 'Improving' },
    ],
  },
  pune: {
    pm25: 52, pm10: 102, no2: 36, o3: 30, so2: 10, co: 0.8,
    temperature: 28, humidity: 58, windSpeed: 13, windDir: 'NW',
    pressure: 1013, visibility: 6.5,
    sources: { traffic: 33, industry: 16, biomass: 10, dust: 26, others: 15 },
    forecast: [
      { hour: '+24', aqi: 95, pm25: 50, condition: 'Stable' },
      { hour: '+48', aqi: 88, pm25: 46, condition: 'Improving' },
      { hour: '+72', aqi: 105, pm25: 56, condition: 'Deteriorating' },
    ],
  },
  lucknow: {
    pm25: 148, pm10: 265, no2: 62, o3: 38, so2: 16, co: 1.4,
    temperature: 27, humidity: 65, windSpeed: 6, windDir: 'NW',
    pressure: 1011, visibility: 3.0,
    sources: { traffic: 22, industry: 16, biomass: 28, dust: 22, others: 12 },
    forecast: [
      { hour: '+24', aqi: 210, pm25: 142, condition: 'Stable' },
      { hour: '+48', aqi: 230, pm25: 155, condition: 'Deteriorating' },
      { hour: '+72', aqi: 195, pm25: 132, condition: 'Improving' },
    ],
  },
  ahmedabad: {
    pm25: 58, pm10: 115, no2: 38, o3: 32, so2: 11, co: 0.7,
    temperature: 32, humidity: 48, windSpeed: 15, windDir: 'W',
    pressure: 1009, visibility: 5.5,
    sources: { traffic: 28, industry: 22, biomass: 12, dust: 24, others: 14 },
    forecast: [
      { hour: '+24', aqi: 110, pm25: 55, condition: 'Stable' },
      { hour: '+48', aqi: 105, pm25: 52, condition: 'Improving' },
      { hour: '+72', aqi: 118, pm25: 60, condition: 'Slight Deterioration' },
    ],
  },
  patna: {
    pm25: 172, pm10: 305, no2: 68, o3: 40, so2: 20, co: 1.6,
    temperature: 28, humidity: 60, windSpeed: 7, windDir: 'E',
    pressure: 1010, visibility: 2.8,
    sources: { traffic: 20, industry: 14, biomass: 32, dust: 24, others: 10 },
    forecast: [
      { hour: '+24', aqi: 240, pm25: 168, condition: 'Stable' },
      { hour: '+48', aqi: 255, pm25: 175, condition: 'Deteriorating' },
      { hour: '+72', aqi: 225, pm25: 158, condition: 'Improving' },
    ],
  },
};
