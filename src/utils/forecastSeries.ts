// Chart rows for the forecast view. Free of imports for unit tests.

export interface SeriesPoint {
  time: string;
  hoursAhead: number;
  naqi: number | null;
  naqiIsLowerBound: boolean;
  category: string | null;
  pm25: number | null;
}

export interface ChartRow {
  time: string;
  hoursAhead: number;
  /** NAQI-method estimate for recent modelled hours (hoursAhead <= 0). */
  recent: number | null;
  /** NAQI-method estimate from the model forecast (hoursAhead >= 0; 0 joins the lines). */
  forecast: number | null;
  isLowerBound: boolean;
  category: string | null;
  pm25: number | null;
  segment: 'recent' | 'forecast';
}

/**
 * Merge recent and forecast points into one time-ordered series with separate
 * value columns, so the two can be drawn with different styles. The current
 * hour (hoursAhead 0) carries both values so the lines connect without
 * presenting the current hour as a forecast.
 */
export function buildForecastRows(recent: SeriesPoint[], forecast: SeriesPoint[]): ChartRow[] {
  const rows: ChartRow[] = [];
  for (const p of recent) {
    rows.push({
      time: p.time, hoursAhead: p.hoursAhead, recent: p.naqi, forecast: p.hoursAhead === 0 ? p.naqi : null,
      isLowerBound: p.naqiIsLowerBound, category: p.category, pm25: p.pm25, segment: 'recent',
    });
  }
  for (const p of forecast) {
    rows.push({
      time: p.time, hoursAhead: p.hoursAhead, recent: null, forecast: p.naqi,
      isLowerBound: p.naqiIsLowerBound, category: p.category, pm25: p.pm25, segment: 'forecast',
    });
  }
  return rows.sort((a, b) => a.hoursAhead - b.hoursAhead);
}

/** Highest and lowest estimate among points with a value, or null. */
export function valueRange(points: SeriesPoint[]): { min: number; max: number } | null {
  const values = points.map(p => p.naqi).filter((v): v is number => v !== null);
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}
