import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api, stubUpstreamFetch, jsonResponse } from '../helpers/server.js';
import { airQualityResponse, weatherResponse, routeOpenMeteo, DELHI_CAMS_SAMPLE } from '../helpers/openMeteoFixtures.js';
import { clearProviderCache } from '../../server/providers/openMeteo.js';
import { upstreamConfig } from '../../server/config.js';

let srv;
let stub;
const defaultTimeout = upstreamConfig.timeoutMs;

before(async () => { srv = await startServer(); });
after(async () => { await srv.close(); });
beforeEach(() => { clearProviderCache(); delete process.env.DATA_MODE; });
afterEach(() => { stub?.restore(); stub = undefined; upstreamConfig.timeoutMs = defaultTimeout; delete process.env.DATA_MODE; });

function useUpstream(airQuality, weather = () => jsonResponse(weatherResponse())) {
  stub = stubUpstreamFetch(routeOpenMeteo({ airQuality, weather }));
}
const getDelhi = () => api(srv.baseUrl, '/api/air-quality/delhi');

describe('live CAMS data (D1, D2, D3 regressions)', () => {
  test('NAQI is computed from the live series, not the fallback (was 360)', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const res = await getDelhi();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.aqi, 134); // hand-computed in naqi.test.js; PM10 dominant
    assert.equal(body.aqiStatus, 'ok');
    assert.equal(body.aqiCategory, 'Moderate');
    assert.deepEqual(body.naqi.dominantPollutants, ['pm10']);
  });

  test('concentrations are passed through unscaled (no ×2/×1.5/×3 factors)', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const body = await (await getDelhi()).json();
    assert.equal(body.pm25, 63.3);
    assert.equal(body.pm10, 152.3);
    assert.equal(body.no2, 29.2);
    assert.equal(body.o3, 101);
  });

  test('all concentrations, including CO, are reported in µg/m³', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const body = await (await getDelhi()).json();
    assert.equal(body.co, 547);
    for (const k of ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co']) assert.equal(body.units[k], 'µg/m³', k);
    assert.equal(body.naqi.subIndices.co.unit, 'mg/m3'); // converted for the CPCB table
  });

  test('modelled data is labelled as a CAMS estimate, not an official CPCB AQI', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const body = await (await getDelhi()).json();
    assert.equal(body.naqi.basis, 'modelled');
    assert.equal(body.naqi.officialCpcb, false);
    assert.match(body.naqi.label, /modelled CAMS/);
    assert.match(body.naqi.label, /not an official CPCB/);
    assert.equal(body.provenance.airQuality.kind, 'modelled');
    assert.equal(body.provenance.airQuality.provider, 'open-meteo');
    assert.equal(body.dataSource, 'open-meteo');
  });

  test('history is the real last-24h modelled series, not a hardcoded timeline', async () => {
    useUpstream(() => jsonResponse(airQualityResponse({ ...DELHI_CAMS_SAMPLE, pm2_5: h => 100 + h })));
    const body = await (await getDelhi()).json();
    assert.equal(body.history.length, 24);
    assert.equal(body.history.at(-1).pm25, 100); // value at the reference hour (h = 0)
    assert.equal(body.history[0].pm25, 77); // h = -23
    assert.equal(body.history.at(-1).time, body.referenceTime);
  });

  test('anomaly detection is reported as unavailable instead of a baseless flag', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const body = await (await getDelhi()).json();
    assert.equal(body.anomaly.status, 'unavailable');
    assert.equal(body.anomaly.isAnomaly, false);
  });

  test('responses are cached; repeated requests do not refetch upstream', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    await getDelhi();
    await getDelhi();
    assert.equal(stub.calls.filter(u => u.includes('air-quality-api')).length, 1);
  });
});

describe('missing and insufficient pollutant data', () => {
  test('missing values stay null (never 0) and NAQI is insufficient_data', async () => {
    useUpstream(() => jsonResponse(airQualityResponse({ ...DELHI_CAMS_SAMPLE, pm2_5: null, pm10: null })));
    const body = await (await getDelhi()).json();
    assert.equal(body.pm25, null);
    assert.equal(body.pm10, null);
    assert.equal(body.aqi, null);
    assert.equal(body.aqiStatus, 'insufficient_data');
    assert.match(body.naqi.reasons.join(' '), /PM2\.5 or PM10/);
  });

  test('fewer than 16 valid hours of PM -> PM sub-index insufficient', async () => {
    const recent = v => h => (h > -10 && h <= 0 ? v : null); // only 10 valid hours
    useUpstream(() => jsonResponse(airQualityResponse({ ...DELHI_CAMS_SAMPLE, pm2_5: recent(63.3), pm10: recent(152.3) })));
    const body = await (await getDelhi()).json();
    assert.equal(body.naqi.subIndices.pm25.status, 'insufficient_data');
    assert.equal(body.naqi.subIndices.pm25.validHours, 10);
    assert.equal(body.aqi, null);
  });

  test('missing weather fields are null, not defaulted (visibility was defaulted to 10 km)', async () => {
    useUpstream(
      () => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)),
      () => jsonResponse(weatherResponse({ visibility: null, wind_direction_10m: null })),
    );
    const body = await (await getDelhi()).json();
    assert.equal(body.visibility, null);
    assert.equal(body.windDirection, null);
    assert.equal(body.temperature, 24.9);
  });
});

describe('upstream failures never fall back to fixtures', () => {
  async function expectUnavailable(reason) {
    const res = await getDelhi();
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error.code, 'UPSTREAM_UNAVAILABLE');
    assert.equal(body.error.details.reason, reason);
    assert.equal(body.pm25, undefined);
    assert.equal(body.aqi, undefined);
    assert.doesNotMatch(JSON.stringify(body), /"dataSource"|fallback|demo/i);
  }

  test('HTTP 500 -> 503', async () => {
    useUpstream(() => new Response('boom', { status: 500 }));
    await expectUnavailable('http_error');
  });

  test('HTTP 429 -> 503 rate_limited', async () => {
    useUpstream(() => new Response('slow down', { status: 429 }));
    await expectUnavailable('rate_limited');
  });

  test('network error -> 503', async () => {
    useUpstream(() => Promise.reject(new TypeError('fetch failed')));
    await expectUnavailable('network');
  });

  test('timeout is bounded -> 503 timeout', async () => {
    upstreamConfig.timeoutMs = 50;
    useUpstream((url, init) => new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason));
    }));
    const started = Date.now();
    await expectUnavailable('timeout');
    assert.ok(Date.now() - started < 2000, 'request should fail fast after the timeout');
  });

  test('invalid JSON -> 503', async () => {
    useUpstream(() => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } }));
    await expectUnavailable('invalid_json');
  });

  test('schema drift: unexpected unit -> 503', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE, { units: { pm2_5: 'ppb' } })));
    await expectUnavailable('schema_mismatch');
  });

  test('schema drift: missing variable -> 503', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE, { omit: ['pm10'] })));
    await expectUnavailable('schema_mismatch');
  });

  test('weather failure alone keeps air quality and marks weather unavailable', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)), () => new Response('x', { status: 502 }));
    const res = await getDelhi();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.aqi, 134);
    assert.equal(body.temperature, null);
    assert.equal(body.provenance.weather.status, 'unavailable');
  });
});

describe('demo mode', () => {
  test('DATA_MODE=demo serves fixtures labelled DEMO and never as live', async () => {
    process.env.DATA_MODE = 'demo';
    stub = stubUpstreamFetch(url => { throw new Error(`no upstream calls in demo mode: ${url}`); });
    const res = await getDelhi();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.provenance.mode, 'demo');
    assert.equal(body.provenance.isLive, false);
    assert.equal(body.provenance.airQuality.kind, 'demo');
    assert.equal(body.provenance.weather.kind, 'demo');
    assert.equal(body.dataSource, 'demo');
    assert.equal(body.naqi.basis, 'demo');
    assert.match(body.naqi.label, /DEMO/);
    assert.equal(body.co, 1800); // fixture CO stored in µg/m³
    assert.deepEqual(stub.calls, []);
  });

  test('live mode responses are never labelled demo', async () => {
    useUpstream(() => jsonResponse(airQualityResponse(DELHI_CAMS_SAMPLE)));
    const body = await (await getDelhi()).json();
    assert.equal(body.provenance.mode, 'live');
    assert.notEqual(body.provenance.airQuality.kind, 'demo');
  });
});
