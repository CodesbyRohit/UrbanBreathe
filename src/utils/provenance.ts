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
export function formatCityTime(iso: string | null | undefined, timeZone = 'Asia/Kolkata'): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const text = new Intl.DateTimeFormat('en-IN', {
    timeZone, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(d);
  return timeZone === 'Asia/Kolkata' ? `${text} IST` : text;
}

/** Short axis label in the city's time zone, e.g. "21 Oct 06:00". */
export function formatAxisTime(iso: string, timeZone = 'Asia/Kolkata'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('hour')}:${get('minute')}`;
}

/**
 * Age of a timestamp relative to `now`, e.g. "12 min ago". Used for data
 * retrieval times — never for the time the values describe.
 */
export function formatAge(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'unknown';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return 'unknown';
  const minutes = Math.round((now - ms) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

/** Hours between the hour the values describe and `now` (>= 0). */
export function hoursOld(iso: string | null | undefined, now: number = Date.now()): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : Math.max(0, (now - ms) / 3_600_000);
}

/** Concentration with unit, e.g. "63.3 µg/m³" or "0.55 mg/m³". */
export function formatConcentration(value: number | null | undefined, unit: string, digits = 1): string {
  const u = unit === 'mg/m3' ? 'mg/m³' : unit === 'ug/m3' ? 'µg/m³' : unit;
  return value === null || value === undefined || !Number.isFinite(value) ? '--' : `${value.toFixed(digits)} ${u}`;
}
