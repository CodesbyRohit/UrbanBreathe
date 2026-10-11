// Labels describing where a displayed value comes from.
// Kept free of imports so it can be unit-tested with Node's built-in runner.

export interface ProvenanceLike {
  mode?: 'live' | 'demo';
  airQuality?: { kind?: string; provider?: string; attribution?: string };
}

export interface ProvenanceBadge {
  text: string;
  detail: string;
  tone: 'modelled' | 'measured' | 'demo' | 'unknown';
  isDemo: boolean;
}

/**
 * Badge for the air-quality data behind a view. Demo data is always labelled
 * DEMO, and modelled data is never described as live, real-time or measured.
 */
export function provenanceBadge(p: ProvenanceLike | null | undefined): ProvenanceBadge {
  const kind = p?.airQuality?.kind;
  if (p?.mode === 'demo' || kind === 'demo') {
    return {
      text: 'DEMO DATA',
      detail: 'Illustrative fixture values — not measurements or model output',
      tone: 'demo',
      isDemo: true,
    };
  }
  if (kind === 'modelled') {
    return {
      text: 'Modelled estimate',
      detail: p?.airQuality?.attribution || 'Model output, not station measurements',
      tone: 'modelled',
      isDemo: false,
    };
  }
  if (kind === 'measured') {
    return { text: 'Station measurement', detail: p?.airQuality?.attribution || '', tone: 'measured', isDemo: false };
  }
  return { text: 'Source unknown', detail: 'Data provenance was not reported', tone: 'unknown', isDemo: false };
}

/** "134", "401+" or "--" for unavailable values. */
export function formatIndex(value: number | null | undefined, isLowerBound = false): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return isLowerBound ? `${Math.round(value)}+` : String(Math.round(value));
}

/** Format a concentration that may be missing. */
export function formatValue(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '--';
  return value.toFixed(digits);
}

/** Hour and date in the city's time zone, e.g. "11 Oct, 7:00 pm IST". */
export function formatCityTime(iso: string, timeZone = 'Asia/Kolkata'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const text = new Intl.DateTimeFormat('en-IN', {
    timeZone, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(d);
  return timeZone === 'Asia/Kolkata' ? `${text} IST` : text;
}
