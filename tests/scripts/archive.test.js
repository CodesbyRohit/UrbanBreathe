import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  archiveRun, runDirName, scheduledFor, checkBody, EXPECTED_CITIES, RESOURCES, INDEX_HEADER,
} from '../../scripts/archive-forecasts.mjs';

const BASE = 'https://example.test';
const REF = '2026-10-21T01:00:00.000Z';

function bodyFor(resource, cityId, { hours = 72 } = {}) {
  const provenance = { mode: 'live', airQuality: { provider: 'open-meteo', kind: 'modelled', retrievedAt: '2026-10-21T01:29:10.000Z' } };
  if (resource === 'forecast') {
    return {
      cityId, referenceTime: REF, retrievedAt: provenance.airQuality.retrievedAt, evaluated: false, provenance,
      recent: [{ time: REF, hoursAhead: 0, naqi: 150 }],
      points: Array.from({ length: hours }, (_, i) => ({ hoursAhead: i + 1, naqi: 150 + i })),
    };
  }
  return { cityId, referenceTime: REF, aqi: 150, naqi: { subIndices: { pm25: {} } }, provenance };
}

/** Stub fetch: `overrides[path]` may return a Response or throw. */
function stubFetch(overrides = {}) {
  const calls = [];
  const fn = async url => {
    const path = url.replace(BASE, '');
    calls.push(path);
    if (overrides[path]) return overrides[path]();
    const json = body => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', 'x-vercel-cache': 'MISS', age: '0', 'set-cookie': 'secret=1' } });
    if (path === '/api/health') return json({ status: 'healthy', deployment: { commit: 'abc123', environment: 'production' } });
    if (path === '/api/cities') return json(EXPECTED_CITIES.map(id => ({ id })));
    const m = /^\/api\/(forecast|air-quality)\/(.+)$/.exec(path);
    return json(bodyFor(m[1], m[2]));
  };
  fn.calls = calls;
  return fn;
}

const run = (outDir, fetchImpl, at = '2026-10-21T01:31:05Z', extra = {}) =>
  archiveRun({ outDir, baseUrl: BASE, runId: '42-1', fetchImpl, now: () => new Date(at), event: 'schedule', cron: '30 1 * * *', delayMs: 0, ...extra });

describe('forecast archive', () => {
  test('a complete run stores every city × resource unmodified, with a manifest and index', async () => {
    const out = mkdtempSync(join(tmpdir(), 'ub-archive-'));
    const m = await run(out, stubFetch());
    assert.equal(m.complete, true);
    assert.equal(m.okRecords, EXPECTED_CITIES.length * RESOURCES.length);
    assert.equal(m.failedRecords, 0);
    assert.deepEqual(m.deployment, { commit: 'abc123', environment: 'production' });
    assert.equal(m.scheduledFor, '2026-10-21T01:30:00.000Z');
    assert.equal(m.runDir, 'runs/2026/10/21/20261021T013105Z-42-1');

    const files = readdirSync(join(out, m.runDir)).sort();
    assert.equal(files.length, EXPECTED_CITIES.length * RESOURCES.length + 1);
    const rec = JSON.parse(readFileSync(join(out, m.runDir, 'delhi.forecast.json'), 'utf8'));
    assert.deepEqual(rec.body, bodyFor('forecast', 'delhi')); // stored unmodified
    assert.equal(rec.archiveSchemaVersion, 1);
    assert.equal(rec.response.headers['x-vercel-cache'], 'MISS');
    assert.equal(rec.response.headers['set-cookie'], undefined); // only whitelisted headers kept
    assert.match(rec.response.bodySha256, /^[0-9a-f]{64}$/);

    const index = readFileSync(join(out, 'index.csv'), 'utf8');
    assert.ok(index.startsWith(INDEX_HEADER));
    assert.match(index, /runs\/2026\/10\/21\/20261021T013105Z-42-1,2026-10-21T01:31:05.000Z,2026-10-21T01:30:00.000Z,schedule,20,0,true,abc123/);
  });

  test('never overwrites an existing run', async () => {
    const out = mkdtempSync(join(tmpdir(), 'ub-archive-'));
    const m = await run(out, stubFetch());
    const manifestPath = join(out, m.runDir, 'manifest.json');
    const before = statSync(manifestPath).mtimeMs;
    const fetchAgain = stubFetch();
    await assert.rejects(run(out, fetchAgain), /already exists/);
    assert.equal(fetchAgain.calls.length, 0); // nothing fetched or written
    assert.equal(statSync(manifestPath).mtimeMs, before);
  });

  test('failed fetches are recorded as error records, and the run is marked incomplete', async () => {
    const out = mkdtempSync(join(tmpdir(), 'ub-archive-'));
    const m = await run(out, stubFetch({
      '/api/forecast/patna': () => new Response(JSON.stringify({ error: { code: 'UPSTREAM_UNAVAILABLE' } }), { status: 503 }),
      '/api/air-quality/pune': () => { throw new TypeError('fetch failed'); },
      '/api/forecast/pune': () => new Response('<html>', { status: 200 }),
    }));
    assert.equal(m.complete, false);
    assert.equal(m.failedRecords, 3);
    const files = readdirSync(join(out, m.runDir));
    assert.ok(files.includes('patna.forecast.error.json'));
    assert.ok(files.includes('pune.air-quality.error.json'));
    assert.ok(files.includes('pune.forecast.error.json'));
    assert.ok(files.includes('patna.air-quality.json')); // other records still written
    const err = JSON.parse(readFileSync(join(out, m.runDir, 'patna.forecast.error.json'), 'utf8'));
    assert.equal(err.error, 'http_503');
    assert.deepEqual(err.body, { error: { code: 'UPSTREAM_UNAVAILABLE' } });
    const net = m.results.find(r => r.cityId === 'pune' && r.resource === 'air-quality');
    assert.match(net.error, /^network: fetch failed/);
    assert.equal(m.results.find(r => r.cityId === 'pune' && r.resource === 'forecast').error, 'invalid_json');
  });

  test('city-list failure falls back to the expected list and is flagged', async () => {
    const out = mkdtempSync(join(tmpdir(), 'ub-archive-'));
    const m = await run(out, stubFetch({ '/api/cities': () => new Response('x', { status: 500 }) }));
    assert.deepEqual(m.cities, EXPECTED_CITIES);
    assert.match(m.cityListNote, /city list unavailable/);
    assert.equal(m.complete, false);
  });

  test('runs append to the index; the header is written once', async () => {
    const out = mkdtempSync(join(tmpdir(), 'ub-archive-'));
    await run(out, stubFetch(), '2026-10-21T01:31:05Z');
    await run(out, stubFetch(), '2026-10-21T13:34:00Z', { cron: '30 13 * * *' });
    const lines = readFileSync(join(out, 'index.csv'), 'utf8').trim().split('\n');
    assert.equal(lines.length, 3);
    assert.match(lines[2], /2026-10-21T13:30:00.000Z/);
  });
});

describe('archive helpers', () => {
  test('run directory names are UTC and sanitised', () => {
    assert.equal(runDirName(new Date('2026-10-21T13:30:59Z'), '7/../x'), join('runs', '2026', '10', '21', '20261021T133059Z-7____x'));
  });

  test('scheduled slot accounts for late starts, including after midnight', () => {
    assert.equal(scheduledFor('30 1 * * *', new Date('2026-10-21T01:47:00Z')), '2026-10-21T01:30:00.000Z');
    assert.equal(scheduledFor('30 13 * * *', new Date('2026-10-22T00:10:00Z')), '2026-10-21T13:30:00.000Z');
    assert.equal(scheduledFor('*/5 * * * *', new Date()), null);
    assert.equal(scheduledFor(null, new Date()), null);
  });

  test('body checks flag wrong city, short horizon and missing provenance', () => {
    assert.deepEqual(checkBody('forecast', 'delhi', bodyFor('forecast', 'delhi')), []);
    assert.match(checkBody('forecast', 'delhi', bodyFor('forecast', 'mumbai')).join(), /expected delhi/);
    assert.match(checkBody('forecast', 'delhi', bodyFor('forecast', 'delhi', { hours: 48 })).join(), /horizon ends at \+48 h/);
    const noProv = { ...bodyFor('air-quality', 'delhi'), provenance: {} };
    assert.match(checkBody('air-quality', 'delhi', noProv).join(), /retrievedAt/);
    assert.deepEqual(checkBody('air-quality', 'delhi', null), ['body is not a JSON object']);
  });
});
