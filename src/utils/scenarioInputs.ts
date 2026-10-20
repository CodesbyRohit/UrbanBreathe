// Parsing of user-edited scenario reductions. Free of imports for unit tests.
// Must stay consistent with server/http/validation.js (validateAssumptions).

export const MAX_REDUCTION_PERCENT = 90;

/** Percent text from an input -> fraction in [0, 0.9], or an error message. */
export function parseReductionPercent(text: string): { fraction: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Enter a percentage (0 to remove the reduction).' };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { error: 'Enter a number.' };
  if (value < 0) return { error: 'Reductions cannot be negative.' };
  if (value > MAX_REDUCTION_PERCENT) return { error: `Use at most ${MAX_REDUCTION_PERCENT}%.` };
  return { fraction: Math.round(value * 10) / 1000 }; // one decimal place of a percent
}

export const toPercentText = (fraction: number) => String(Math.round(fraction * 1000) / 10);

/**
 * Build the `assumptions` payload: for each selected intervention whose edited
 * fractions differ from its default, the full replacement map. Returns null if
 * any edited field is invalid.
 */
export function buildAssumptions(
  selected: string[],
  defaults: Record<string, Record<string, number>>,
  edits: Record<string, Record<string, string>>,
): Record<string, Record<string, number>> | null {
  const out: Record<string, Record<string, number>> = {};
  for (const id of selected) {
    const fields = edits[id];
    if (!fields) continue;
    const map: Record<string, number> = {};
    for (const [pollutant, text] of Object.entries(fields)) {
      const parsed = parseReductionPercent(text);
      if ('error' in parsed) return null;
      map[pollutant] = parsed.fraction;
    }
    const base = defaults[id] ?? {};
    const keys = new Set([...Object.keys(base), ...Object.keys(map)]);
    const differs = [...keys].some(k => (map[k] ?? base[k] ?? 0) !== (base[k] ?? 0));
    if (differs) out[id] = { ...base, ...map };
  }
  return out;
}
