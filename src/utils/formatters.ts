// CPCB NAQI category helpers for display. Colour is never the only signal:
// every use pairs it with the category name.

/** Neutral colour for unavailable values. */
export const NO_DATA_COLOR = '#64748b';

export const CATEGORY_RANGES: { label: string; min: number; max: number | null }[] = [
  { label: 'Good', min: 0, max: 50 },
  { label: 'Satisfactory', min: 51, max: 100 },
  { label: 'Moderate', min: 101, max: 200 },
  { label: 'Poor', min: 201, max: 300 },
  { label: 'Very Poor', min: 301, max: 400 },
  { label: 'Severe', min: 401, max: null },
];

export function getAQIColor(aqi: number | null | undefined): string {
  if (aqi == null || !Number.isFinite(aqi)) return NO_DATA_COLOR;
  if (aqi <= 50) return '#15803d';
  if (aqi <= 100) return '#4d7c0f';
  if (aqi <= 200) return '#854d0e';
  if (aqi <= 300) return '#c2410c';
  if (aqi <= 400) return '#b91c1c';
  return '#6d28d9';
}

/** Lighter AQI color variants for use on dark backgrounds (e.g., dark mode) */
export function getAQIColorLight(aqi: number | null | undefined): string {
  if (aqi == null || !Number.isFinite(aqi)) return '#94a3b8';
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#facc15';
  if (aqi <= 300) return '#fb923c';
  if (aqi <= 400) return '#f87171';
  return '#a78bfa';
}

export function getAQILabel(aqi: number | null | undefined): string {
  if (aqi == null || isNaN(aqi)) return 'No estimate';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}
