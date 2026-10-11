// TEMPORARY: legacy static values still read by routes that are migrated to live
// data in later commits. Live air-quality data now comes from
// server/providers/openMeteo.js via server/services/cityAirQuality.js.
import { fallbackData } from '../data/fallbackData.js';

export function getFallbackData(cityId) {
  return fallbackData[cityId];
}
