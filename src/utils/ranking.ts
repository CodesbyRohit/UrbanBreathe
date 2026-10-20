// Ordering of cities by NAQI-method estimate. Free of imports for unit tests.

export type RankSort = 'aqi_desc' | 'aqi_asc' | 'name';

export interface Rankable {
  cityName: string;
  aqi: number | null;
  isLowerBound: boolean;
}

/** Comparable value: a "401+" lower bound sorts above an exact 401. */
function sortValue(r: Rankable): number {
  return (r.aqi as number) + (r.isLowerBound ? 0.5 : 0);
}

/**
 * Sort by estimate (cities without an estimate always last, by name) or by name.
 * Returns a new array.
 */
export function rankCities<T extends Rankable>(rows: T[], sort: RankSort): T[] {
  const byName = (a: T, b: T) => a.cityName.localeCompare(b.cityName);
  if (sort === 'name') return [...rows].sort(byName);
  const dir = sort === 'aqi_desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    if (a.aqi === null && b.aqi === null) return byName(a, b);
    if (a.aqi === null) return 1;
    if (b.aqi === null) return -1;
    return dir * (sortValue(a) - sortValue(b)) || byName(a, b);
  });
}
