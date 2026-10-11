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
};
