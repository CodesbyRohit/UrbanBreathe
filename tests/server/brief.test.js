import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api, stubUpstreamFetch, jsonResponse } from '../helpers/server.js';
import { airQualityResponse, weatherResponse, routeOpenMeteo, DELHI_CAMS_SAMPLE } from '../helpers/openMeteoFixtures.js';
import { clearProviderCache } from '../../server/providers/openMeteo.js';

let srv;
let stub;
before(async () => { srv = await startServer(); });
after(async () => { await srv.close(); });
beforeEach(() => { clearProviderCache(); });
afterEach(() => stub?.restore());

function useValues(values) {
  stub = stubUpstreamFetch(routeOpenMeteo({
    airQuality: () => jsonResponse(airQualityResponse(values)),
    weather: () => jsonResponse(weatherResponse()),
  }));
}
const generate = async (body = { cityId: 'delhi' }) => api(srv.baseUrl, '/api/brief/generate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('brief is consistent and never contains "undefined" (was "AQI of undefined", Severe, MODERATE)', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const res = await generate();
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.doesNotMatch(JSON.stringify(body), /undefined/);
  assert.equal(body.executiveSummary.currentAQI, 134);
  assert.equal(body.executiveSummary.category, 'Moderate');
  assert.deepEqual(body.executiveSummary.dominantPollutants, ['PM10']);
  assert.match(body.currentSituation.overview, /NAQI-method estimate 134 \(Moderate\)/);
  assert.equal(body.executiveSummary.criticality, undefined);
});

test('no classification stamp, hard-coded confidence or invented outcomes', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await (await generate()).json();
  assert.equal(body.classification, undefined);
  assert.equal(body.confidenceLevel, undefined);
  assert.equal(body.expectedOutcomes, undefined);
  assert.ok(body.recommendations.every(r => r.expectedImpact === undefined));
  assert.doesNotMatch(JSON.stringify(body), /CONFIDENTIAL|admissions|GRAP Stage III/i);
  assert.equal(body.forecast.evaluated, false);
  assert.ok(body.limitations.some(l => /not the official CPCB/.test(l)));
});

test('Very Poor/Severe recommendations quote CPCB §3.4 guidance; GRAP only for Delhi', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: 200 }); // PM2.5 200 -> Very Poor
  const body = await (await generate()).json();
  assert.equal(body.executiveSummary.category, 'Very Poor');
  assert.ok(body.recommendations.some(r => /§3\.4/.test(r.basis)));
  assert.ok(body.recommendations.some(r => /GRAP/.test(r.action)));

  clearProviderCache();
  const mumbai = await (await generate({ cityId: 'mumbai' })).json();
  assert.ok(mumbai.recommendations.every(r => !/GRAP/.test(r.action)));
});

test('dates are rendered in IST regardless of server time zone', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const original = process.env.TZ;
  try {
    process.env.TZ = 'America/Los_Angeles';
    const body = await (await generate()).json();
    const expected = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(body.generatedAt));
    assert.equal(body.date, expected);
  } finally {
    if (original === undefined) delete process.env.TZ; else process.env.TZ = original;
  }
});

test('optional interventions add a labelled illustrative scenario', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await (await generate({ cityId: 'delhi', interventions: ['dust_suppression'] })).json();
  assert.equal(body.scenario.kind, 'illustrative-scenario');
});

test('insufficient data -> explicit reasons, no category', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: null, pm10: null });
  const body = await (await generate()).json();
  assert.equal(body.executiveSummary.currentAQI, null);
  assert.equal(body.executiveSummary.category, null);
  assert.match(body.currentSituation.overview, /could not be computed/);
  assert.doesNotMatch(JSON.stringify(body), /undefined/);
});

test('upstream failure -> 503 instead of a brief built from static values', async () => {
  stub = stubUpstreamFetch(() => new Response('down', { status: 500 }));
  const res = await generate();
  assert.equal(res.status, 503);
});
