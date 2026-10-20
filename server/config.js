// Runtime configuration.
//
// DATA_MODE=demo serves deterministic, clearly labelled demo fixtures instead of
// live provider data. Any other value (or unset) means live mode. In live mode a
// provider failure is reported as unavailable — fixtures are never substituted.

export function getDataMode() {
  return process.env.DATA_MODE === 'demo' ? 'demo' : 'live';
}

export const upstreamConfig = {
  timeoutMs: 8000,
  cacheTtlMs: 10 * 60 * 1000,
  cacheMaxEntries: 200,
  // A 6-day hourly response for six pollutants is ~10 kB; anything far larger
  // indicates a provider change and is rejected rather than parsed.
  maxResponseBytes: 2 * 1024 * 1024,
};

/**
 * Browser origins allowed to call the API cross-origin, from CORS_ORIGINS
 * (comma-separated). Empty by default: the frontend is served from the same
 * origin on Vercel and through the Vite proxy in development, so no CORS
 * headers are needed.
 */
export function getCorsOrigins() {
  return (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}
