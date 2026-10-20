#!/usr/bin/env node
// Prospective forecast archive (see docs/methodology/forecast-archive.md).
//
// Fetches the deployed /api/forecast and /api/air-quality responses for every
// city and writes them, unmodified, into a new run directory with a manifest.
// Records are never overwritten: the run directory and every file are created
// exclusively, and a failed fetch is written as an error record, not skipped.
// No dependencies; Node 20+ (global fetch).

import { mkdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ARCHIVE_SCHEMA_VERSION = 1;
export const DEFAULT_BASE_URL = 'https://urban-breathe-nine.vercel.app';
export const RESOURCES = ['forecast', 'air-quality'];
// The ten cities served when the archive started. Used if /api/cities fails,
// and to flag any change in the served list.
export const EXPECTED_CITIES = ['delhi', 'mumbai', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'pune', 'lucknow', 'ahmedabad', 'patna'];
// Response headers kept for freshness/caching analysis.
export const KEPT_HEADERS = ['date', 'age', 'cache-control', 'x-vercel-cache', 'x-vercel-id', 'content-type', 'content-length'];
export const INDEX_HEADER = 'run_dir,started_at,scheduled_for,event,ok,failed,complete,deployment_commit\n';

const sha256 = text => createHash('sha256').update(text).digest('hex');
const pad = n => String(n).padStart(2, '0');

/** "runs/2026/10/21/20261021T013012Z-123-1" for a start time and run id. */
export function runDirName(startedAt, runId) {
  const d = startedAt;
  const stamp = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  const safeId = String(runId).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60);
  return join('runs', String(d.getUTCFullYear()), pad(d.getUTCMonth() + 1), pad(d.getUTCDate()), `${stamp}-${safeId}`);
}

/**
 * Slot a scheduled run was meant for, from a cron of the form "M H * * *"
 * and the actual start time (GitHub may start scheduled runs late).
 * Returns null for other events or cron shapes.
 */
export function scheduledFor(cron, startedAt) {
  const m = /^(\d{1,2}) (\d{1,2}) \* \* \*$/.exec(String(cron || '').trim());
  if (!m) return null;
  const slot = new Date(Date.UTC(startedAt.getUTCFullYear(), startedAt.getUTCMonth(), startedAt.getUTCDate(), Number(m[2]), Number(m[1])));
  if (slot > startedAt) slot.setUTCDate(slot.getUTCDate() - 1); // started after midnight for yesterday's slot
  return slot.toISOString();
}

/** Structural checks on a response body; problems are recorded, never fatal. */
export function checkBody(resource, cityId, body) {
  const problems = [];
  if (!body || typeof body !== 'object') return ['body is not a JSON object'];
  if (body.cityId !== cityId) problems.push(`cityId is ${JSON.stringify(body.cityId)}, expected ${cityId}`);
  if (typeof body.referenceTime !== 'string' || Number.isNaN(Date.parse(body.referenceTime))) problems.push('missing or invalid referenceTime');
  if (!body.provenance?.airQuality?.retrievedAt) problems.push('missing provenance.airQuality.retrievedAt');
  if (resource === 'forecast') {
    if (!Array.isArray(body.points) || body.points.length === 0) problems.push('no forecast points');
    else {
      const leads = body.points.map(p => p.hoursAhead);
      if (Math.max(...leads) < 72) problems.push(`horizon ends at +${Math.max(...leads)} h, expected ≥ 72`);
    }
    if (!Array.isArray(body.recent)) problems.push('no recent series');
  }
  if (resource === 'air-quality' && !body.naqi?.subIndices) problems.push('missing naqi.subIndices');
  return problems;
}

/** GET a URL and describe the outcome without throwing. */
export async function fetchRecord(fetchImpl, url, { timeoutMs = 30_000 } = {}) {
  const requestedAt = new Date();
  const out = { url, requestedAt: requestedAt.toISOString(), receivedAt: null, durationMs: null, status: null, headers: {}, error: null, bodySha256: null, body: null };
  try {
    const res = await fetchImpl(url, { headers: { accept: 'application/json', 'user-agent': 'urbanbreathe-forecast-archive' }, signal: AbortSignal.timeout(timeoutMs) });
    const text = await res.text();
    const receivedAt = new Date();
    out.receivedAt = receivedAt.toISOString();
    out.durationMs = receivedAt - requestedAt;
    out.status = res.status;
    for (const h of KEPT_HEADERS) { const v = res.headers.get(h); if (v !== null) out.headers[h] = v; }
    out.bodySha256 = sha256(text);
    try { out.body = JSON.parse(text); } catch { out.error = 'invalid_json'; out.bodyPreview = text.slice(0, 500); }
    if (!res.ok && !out.error) out.error = `http_${res.status}`;
  } catch (err) {
    out.receivedAt = new Date().toISOString();
    out.durationMs = Date.now() - requestedAt.getTime();
    out.error = err?.name === 'TimeoutError' ? 'timeout' : `network: ${err?.message ?? err}`;
  }
  return out;
}

/** Write a file only if it does not exist yet ("wx"); never overwrites. */
function writeNew(path, data) {
  writeFileSync(path, data, { flag: 'wx' });
}

/**
 * Archive one run. Returns the manifest. Throws only if the run directory
 * already exists or cannot be created (nothing is written in that case).
 */
export async function archiveRun({
  outDir, baseUrl = DEFAULT_BASE_URL, runId, fetchImpl = globalThis.fetch,
  now = () => new Date(), event = null, cron = null, workflow = {}, delayMs = 250,
}) {
  const startedAt = now();
  const runDirRel = runDirName(startedAt, runId);
  const runDir = join(outDir, runDirRel);
  if (existsSync(runDir)) throw new Error(`run directory already exists: ${runDirRel}`);
  mkdirSync(join(runDir, '..'), { recursive: true });
  mkdirSync(runDir); // non-recursive: fails if it appeared concurrently

  const base = baseUrl.replace(/\/+$/, '');
  const health = await fetchRecord(fetchImpl, `${base}/api/health`);
  const citiesRes = await fetchRecord(fetchImpl, `${base}/api/cities`);
  const served = Array.isArray(citiesRes.body) ? citiesRes.body.map(c => c?.id).filter(id => typeof id === 'string') : null;
  const cities = served ?? EXPECTED_CITIES;
  const cityListNote = served === null
    ? `city list unavailable (${citiesRes.error}); used the expected list`
    : served.join(',') === EXPECTED_CITIES.join(',') ? null : `served city list differs from expected: ${served.join(',')}`;

  const results = [];
  for (const cityId of cities) {
    for (const resource of RESOURCES) {
      const rec = await fetchRecord(fetchImpl, `${base}/api/${resource}/${encodeURIComponent(cityId)}`);
      const problems = rec.error ? [] : checkBody(resource, cityId, rec.body);
      const ok = !rec.error && problems.length === 0;
      const file = `${cityId}.${resource}${rec.error ? '.error' : ''}.json`;
      const record = {
        archiveSchemaVersion: ARCHIVE_SCHEMA_VERSION,
        resource, cityId, runDir: runDirRel.split('\\').join('/'),
        request: { url: rec.url, requestedAt: rec.requestedAt },
        response: { status: rec.status, receivedAt: rec.receivedAt, durationMs: rec.durationMs, headers: rec.headers, bodySha256: rec.bodySha256 },
        error: rec.error, checks: { ok, problems },
        ...(rec.bodyPreview !== undefined ? { bodyPreview: rec.bodyPreview } : {}),
        body: rec.body,
      };
      const json = JSON.stringify(record);
      writeNew(join(runDir, file), json);
      results.push({
        cityId, resource, file, ok, status: rec.status, error: rec.error, problems,
        referenceTime: rec.body?.referenceTime ?? null,
        retrievedAt: rec.body?.provenance?.airQuality?.retrievedAt ?? null,
        xVercelCache: rec.headers['x-vercel-cache'] ?? null,
        bytes: Buffer.byteLength(json), sha256: sha256(json),
      });
      if (delayMs) await new Promise(r => setTimeout(r, delayMs));
    }
  }

  const finishedAt = now();
  const okCount = results.filter(r => r.ok).length;
  const manifest = {
    archiveSchemaVersion: ARCHIVE_SCHEMA_VERSION,
    runDir: runDirRel.split('\\').join('/'),
    runId: String(runId),
    event, cron,
    scheduledFor: event === 'schedule' ? scheduledFor(cron, startedAt) : null,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    baseUrl: base,
    workflow,
    deployment: health.body?.deployment ?? null,
    health: { status: health.status, error: health.error, body: health.body },
    cities, cityListNote,
    expectedRecords: cities.length * RESOURCES.length,
    okRecords: okCount,
    failedRecords: results.length - okCount,
    complete: okCount === EXPECTED_CITIES.length * RESOURCES.length && cityListNote === null,
    results,
    sources: 'Responses of the UrbanBreathe API, which derives from CAMS global forecasts via Open-Meteo (CC BY 4.0). Attribution: Copernicus Atmosphere Monitoring Service; Open-Meteo.',
  };
  writeNew(join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Append-only run index for gap analysis.
  const indexPath = join(outDir, 'index.csv');
  if (!existsSync(indexPath)) writeNew(indexPath, INDEX_HEADER);
  appendFileSync(indexPath, [manifest.runDir, manifest.startedAt, manifest.scheduledFor ?? '', event ?? '', okCount, manifest.failedRecords, manifest.complete, manifest.deployment?.commit ?? ''].join(',') + '\n');

  return manifest;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.out) { console.error('usage: archive-forecasts.mjs --out <archive dir> [--run-id <id>] [--base-url <url>]'); process.exit(64); }
  const env = process.env;
  const manifest = await archiveRun({
    outDir: args.out,
    baseUrl: args['base-url'] || env.ARCHIVE_BASE_URL || DEFAULT_BASE_URL,
    runId: args['run-id'] || `${env.GITHUB_RUN_ID ?? 'local'}-${env.GITHUB_RUN_ATTEMPT ?? '1'}`,
    event: env.GITHUB_EVENT_NAME || 'manual',
    cron: env.ARCHIVE_CRON || null,
    workflow: {
      repository: env.GITHUB_REPOSITORY ?? null, ref: env.GITHUB_REF ?? null, sha: env.GITHUB_SHA ?? null,
      runId: env.GITHUB_RUN_ID ?? null, runAttempt: env.GITHUB_RUN_ATTEMPT ?? null, workflow: env.GITHUB_WORKFLOW ?? null,
    },
  });
  const summary = { runDir: manifest.runDir, ok: manifest.okRecords, failed: manifest.failedRecords, complete: manifest.complete, deployment: manifest.deployment, cityListNote: manifest.cityListNote };
  console.log(JSON.stringify(summary, null, 2));
  for (const r of manifest.results.filter(x => !x.ok)) console.log(`FAILED ${r.cityId} ${r.resource}: ${r.error ?? r.problems.join('; ')}`);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `run_dir=${manifest.runDir}\ncomplete=${manifest.complete}\n`);
  // Exit 0 whenever a manifest was written, so partial runs are still committed;
  // the workflow fails the job afterwards if the run was incomplete.
  console.log(`manifest: ${relative(process.cwd(), join(args.out, manifest.runDir, 'manifest.json'))}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => { console.error(err?.stack || String(err)); process.exit(1); });
}
