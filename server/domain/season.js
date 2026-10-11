// Seasons for Indian cities, evaluated in the city's own time zone (never the
// server's), following the four-season convention used with IMD data:
// Jan–Feb winter, Mar–May pre-monsoon, Jun–Sep (south-west) monsoon,
// Oct–Dec post-monsoon. Published sources differ on the exact boundaries;
// this is contextual metadata only and drives no calculations.

export const INDIA_SEASONS = [
  { id: 'winter', label: 'Winter', months: [1, 2] },
  { id: 'pre_monsoon', label: 'Pre-monsoon', months: [3, 4, 5] },
  { id: 'monsoon', label: 'Monsoon', months: [6, 7, 8, 9] },
  { id: 'post_monsoon', label: 'Post-monsoon', months: [10, 11, 12] },
];

export const SEASON_BASIS = 'IMD four-season convention (Jan–Feb winter, Mar–May pre-monsoon, Jun–Sep monsoon, Oct–Dec post-monsoon)';

/** Calendar month (1–12) of `date` in `timeZone`. */
export function monthInTimeZone(date, timeZone) {
  const month = new Intl.DateTimeFormat('en-US', { timeZone, month: 'numeric' }).format(date);
  return Number(month);
}

export function getIndiaSeason(date = new Date(), timeZone = 'Asia/Kolkata') {
  const month = monthInTimeZone(date, timeZone);
  const season = INDIA_SEASONS.find(s => s.months.includes(month));
  return { id: season.id, label: season.label, timeZone, basis: SEASON_BASIS };
}

/** Human-readable date in the city's time zone, e.g. "Sunday, 11 October 2026". */
export function formatDateInZone(date, timeZone = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}
