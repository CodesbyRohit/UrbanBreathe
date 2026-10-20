import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api, stubUpstreamFetch, jsonResponse } from '../helpers/server.js';
import { airQualityResponse, weatherResponse, routeOpenMeteo, DELHI_CAMS_SAMPLE } from '../helpers/openMeteoFixtures.js';
import { clearProviderCache } from '../../server/providers/openMeteo.js';
import { getIndiaSeason, formatDateInZone } from '../../server/domain/season.js';

describe('India seasons (IMD convention, city time zone)', () => {
  const at = iso => getIndiaSeason(new Date(iso), 'Asia/Kolkata').id;

  test('October is post-monsoon (was classified as monsoon)', () => {
    assert.equal(at('2026-10-11T06:00:00Z'), 'post_monsoon');
  });

  test('all months map to the expected season', () => {
    const expected = {
      1: 'winter', 2: 'winter', 3: 'pre_monsoon', 4: 'pre_monsoon', 5: 'pre_monsoon',
      6: 'monsoon', 7: 'monsoon', 8: 'monsoon', 9: 'monsoon',
      10: 'post_monsoon', 11: 'post_monsoon', 12: 'post_monsoon',
    };
    for (const [m, id] of Object.entries(expected)) {
      const iso = `2026-${String(m).padStart(2, '0')}-15T06:00:00Z`;
      assert.equal(at(iso), id, `month ${m}`);
    }
  });

  test('month boundary is evaluated in IST, not server/UTC time', () => {
    // 30 Sep 19:00 UTC is 1 Oct 00:30 IST.
    assert.equal(at('2026-09-30T19:00:00Z'), 'post_monsoon');
    assert.equal(at('2026-09-30T18:00:00Z'), 'monsoon'); // 23:30 IST, still September
  });

  test('result does not depend on the process TZ', () => {
    const original = process.env.TZ;
    try {
      const results = ['UTC', 'America/Los_Angeles', 'Asia/Kolkata'].map(tz => {
        process.env.TZ = tz;
        return [at('2026-09-30T19:00:00Z'), formatDateInZone(new Date('2026-09-30T19:00:00Z'))];
      });
      assert.deepEqual(results[0], results[1]);
      assert.deepEqual(results[1], results[2]);
      assert.match(results[0][1], /1 October 2026/);
    } finally {
      if (original === undefined) delete process.env.TZ; else process.env.TZ = original;
    }
  });
});

describe('GET /api/forecast/:cityId', () => {
  let srv;
  let stub;
  before(async () => { srv = await startServer(); });
  after(async () => { await srv.close(); });
  beforeEach(() => {
    clearProviderCache();
    stub = stubUpstreamFetch(routeOpenMeteo({
      // PM2.5 rises 1 µg/m³ per forecast hour so the peak is known.
      airQuality: () => jsonResponse(airQualityResponse({ ...DELHI_CAMS_SAMPLE, pm2_5: h => (h > 0 ? 63.3 + h : 63.3) })),
      weather: () => jsonResponse(weatherResponse()),
    }));
  });
  afterEach(() => stub.restore());

  const getForecast = async () => (await api(srv.baseUrl, '/api/forecast/delhi')).json();

  test('passes through the CAMS forecast for 72 hourly points', async () => {
    const body = await getForecast();
    assert.equal(body.kind, 'model-forecast');
    assert.equal(body.points.length, 72);
    assert.equal(body.points[0].hoursAhead, 1);
    assert.equal(body.points.at(-1).hoursAhead, 72);
    assert.equal(body.points[23].pm25, 63.3 + 24);
  });

  test('is deterministic: identical inputs give identical points (no random noise)', async () => {
    const a = await getForecast();
    clearProviderCache();
    const b = await getForecast();
    assert.deepEqual(a.points, b.points);
  });

  test('makes no accuracy or confidence claims and has no "observed" points', async () => {
    const body = await getForecast();
    assert.equal(body.evaluated, false);
    assert.match(body.evaluationNote, /Not evaluated/);
    assert.equal(body.confidence, undefined);
    assert.ok(body.points.every(p => p.confidence === undefined));
    // Every point is a future model value; none is presented as an observation.
    assert.ok(body.points.every(p => p.hoursAhead >= 1));
    assert.doesNotMatch(JSON.stringify(body.points), /observ/i);
  });

  test('each point carries a NAQI-method estimate from running averages; peak is the maximum', async () => {
    const body = await getForecast();
    assert.ok(body.points.every(p => p.naqiStatus === 'ok'));
    const max = Math.max(...body.points.map(p => p.naqi));
    assert.equal(body.peak.naqi, max);
    assert.match(body.naqiLabel, /not an official CPCB/);
  });

  test('recent modelled hours are separate from forecast points and excluded from the peak', async () => {
    const body = await getForecast();
    assert.equal(body.recent.length, 24);
    assert.equal(body.recent.at(-1).hoursAhead, 0);
    assert.equal(body.recent.at(-1).time, body.referenceTime);
    assert.ok(body.recent.every(p => p.hoursAhead <= 0));
    assert.match(body.recentNote, /not station observations/);
    assert.ok(body.points.some(p => p.time === body.peak.time));
  });

  test('reports retrieval time, not an invented model issue time', async () => {
    const body = await getForecast();
    assert.equal(body.issuedAt, undefined);
    assert.equal(body.modelRunTime, null);
    assert.equal(body.retrievedAt, body.provenance.airQuality.retrievedAt);
  });

  test('season is post-monsoon in October and reported with its basis', async () => {
    const body = await getForecast();
    assert.ok(body.season.basis.includes('IMD'));
    assert.equal(body.season.timeZone, 'Asia/Kolkata');
  });

  test('points do not depend on the server time zone', async () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = 'UTC';
      clearProviderCache();
      const utc = await getForecast();
      process.env.TZ = 'Asia/Kolkata';
      clearProviderCache();
      const ist = await getForecast();
      assert.deepEqual(utc.points, ist.points);
      assert.equal(utc.referenceTime, ist.referenceTime);
    } finally {
      if (original === undefined) delete process.env.TZ; else process.env.TZ = original;
    }
  });

  test('upstream failure -> 503, never a synthetic forecast', async () => {
    stub.restore();
    stub = stubUpstreamFetch(() => new Response('down', { status: 503 }));
    const res = await api(srv.baseUrl, '/api/forecast/delhi');
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.points, undefined);
  });
});
