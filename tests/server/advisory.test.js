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
const getAdvisory = async (q = '') => (await api(srv.baseUrl, `/api/advisory/delhi${q}`)).json();

test('advisory uses the NAQI-method estimate, not PM2.5 × 1.5 from static data', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await getAdvisory();
  assert.equal(body.aqi, 134); // old code: 198 * 1.5 = 297 regardless of live data
  assert.equal(body.category, 'Moderate');
  assert.match(body.naqiLabel, /not an official CPCB/);
});

test('primary health text is the CPCB Table 3.12 statement for the category', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await getAdvisory();
  assert.match(body.healthStatement, /^May cause breathing discomfort to the people with lung disease such as asthma/);
  assert.match(body.healthStatementSource, /Table 3\.12/);
});

test('no fabricated helplines or emergency-protocol claims', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: 400 }); // Severe
  const body = await getAdvisory();
  const text = JSON.stringify(body);
  assert.doesNotMatch(text, /1800-111-222|1800-111-333/);
  assert.doesNotMatch(text, /activated emergency protocols/i);
  assert.doesNotMatch(text, /Health emergency/i);
  assert.deepEqual(body.emergencyContacts, [{ label: 'National emergency number (ERSS)', number: '112' }]);
  assert.equal(body.category, 'Severe');
  assert.equal(body.aqiIsLowerBound, true);
});

test('?lang selects the translated guidance; invalid lang -> 400', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const hi = await getAdvisory('?lang=hi');
  assert.equal(hi.lang, 'hi');
  assert.equal(hi.message, hi.multilingual.hi);
  const res = await api(srv.baseUrl, '/api/advisory/delhi?lang=fr');
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'INVALID_LANGUAGE');
});

test('insufficient data -> no category, no precautions, explicit message', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: null, pm10: null });
  const body = await getAdvisory();
  assert.equal(body.status, 'insufficient_data');
  assert.equal(body.aqi, null);
  assert.equal(body.category, null);
  assert.deepEqual(body.precautions, []);
  assert.match(body.healthAdvisory, /Not enough valid data/);
});

test('untranslated message falls back to English and says so (was null)', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: null, pm10: null });
  const body = await getAdvisory('?lang=te');
  assert.match(body.message, /Not enough valid data/);
  assert.equal(body.messageLang, 'en');
  useValues(DELHI_CAMS_SAMPLE);
  clearProviderCache();
  assert.equal((await getAdvisory('?lang=te')).messageLang, 'te');
});
