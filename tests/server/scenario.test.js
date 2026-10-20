import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api, stubUpstreamFetch, jsonResponse } from '../helpers/server.js';
import { airQualityResponse, weatherResponse, routeOpenMeteo, DELHI_CAMS_SAMPLE } from '../helpers/openMeteoFixtures.js';
import { clearProviderCache } from '../../server/providers/openMeteo.js';
import { combineReductions, INTERVENTION_IDS } from '../../server/services/scenario.js';

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
const run = async interventions => (await api(srv.baseUrl, '/api/simulation/run', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ cityId: 'delhi', interventions }),
})).json();

test('no health, exposure, cost or effectiveness outputs (fabricated admissions removed)', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await run(['construction_ban', 'odd_even']);
  for (const k of ['baselineAdmissions', 'predictedAdmissions', 'avertedAdmissions', 'population', 'exposedPopulation', 'totalCostCrores', 'effectiveness', 'improvementPercentage']) {
    assert.equal(body[k], undefined, k);
  }
  assert.equal(body.kind, 'illustrative-scenario');
  assert.match(body.disclaimer, /not a prediction/);
  assert.match(body.assumptionNote, /uncited placeholder/);
});

test('intervention catalogue has no cost, support or timing claims', async () => {
  const list = await (await api(srv.baseUrl, '/api/simulation/interventions')).json();
  assert.equal(list.length, 8);
  for (const iv of list) {
    assert.equal(iv.cost, undefined);
    assert.equal(iv.costUnit, undefined);
    assert.equal(iv.publicSupport, undefined);
    assert.equal(iv.timeToEffect, undefined);
    assert.ok(iv.assumedReduction);
  }
});

test('scenario re-applies the NAQI method to reduced live means (hand-computed)', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await run(['construction_ban', 'odd_even']);
  // Combined: pm10 0.35; pm25 1-(0.8*0.88)=0.296; no2 0.25; co 0.25.
  assert.deepEqual(body.combinedReductions, { pm10: 0.35, pm25: 0.296, no2: 0.25, co: 0.25 });
  // Scenario means: PM10 152.3*0.65=99.0 -> 99; PM2.5 63.3*0.704=44.56 -> 74;
  // NO2 21.9 -> 28; CO 0.41 mg/m³ -> 20; O3 unchanged -> 100; SO2 -> 41.
  assert.equal(body.baselineAQI, 134);
  assert.equal(body.scenarioAQI, 100);
  assert.equal(body.aqiChange, -34);
  assert.equal(body.baselinePM25, 63.3);
  // Displayed with the same precision as the baseline mean (was 44.56 vs 63.3).
  assert.equal(body.scenarioPM25, 44.6);
});

test('per-pollutant breakdown matches the overall result and the NAQI table', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await run(['construction_ban', 'odd_even']);
  const byKey = Object.fromEntries(body.pollutants.map(p => [p.pollutant, p]));
  assert.equal(byKey.pm10.baselineSubIndex, 134);
  assert.equal(byKey.pm10.scenarioSubIndex, 99);
  assert.equal(byKey.pm10.reduction, 0.35);
  assert.equal(byKey.o3.reduction, 0);
  assert.equal(byKey.o3.scenarioSubIndex, byKey.o3.baselineSubIndex);
  assert.equal(Math.max(...body.pollutants.map(p => p.scenarioSubIndex)), body.scenarioAQI);
  assert.deepEqual(body.scenarioDominantPollutants, ['o3']);
  assert.ok(body.calculationSteps.length >= 3);
  assert.equal(body.assumptionsEdited, false);
  assert.ok(body.interventions.every(iv => iv.assumptionSource === 'placeholder-default'));
});

const runWith = async payload => api(srv.baseUrl, '/api/simulation/run', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ cityId: 'delhi', ...payload }),
});

test('user-edited assumptions replace the placeholder map and are labelled', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const res = await runWith({ interventions: ['dust_suppression'], assumptions: { dust_suppression: { pm10: 0.5 } } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.combinedReductions, { pm10: 0.5 }); // pm25 default dropped
  assert.equal(body.assumptionsEdited, true);
  assert.equal(body.interventions[0].assumptionSource, 'user-edited');
  assert.deepEqual(body.interventions[0].defaultReduction, { pm10: 0.25, pm25: 0.1 });
  assert.match(body.assumptionNote, /edited by the user/);
});

test('zero reductions leave the estimate unchanged', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await (await runWith({ interventions: ['dust_suppression'], assumptions: { dust_suppression: { pm10: 0, pm25: 0 } } })).json();
  assert.equal(body.scenarioAQI, body.baselineAQI);
  assert.equal(body.aqiChange, 0);
});

test('invalid assumptions are rejected with 400 before any upstream call', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const cases = [
    { interventions: ['dust_suppression'], assumptions: [] },
    { interventions: ['dust_suppression'], assumptions: { odd_even: { pm10: 0.1 } } }, // not selected
    { interventions: ['dust_suppression'], assumptions: { dust_suppression: { benzene: 0.1 } } },
    { interventions: ['dust_suppression'], assumptions: { dust_suppression: { pm10: -0.1 } } },
    { interventions: ['dust_suppression'], assumptions: { dust_suppression: { pm10: 1 } } },
    { interventions: ['dust_suppression'], assumptions: { dust_suppression: { pm10: '0.2' } } },
    { interventions: ['dust_suppression'], assumptions: { dust_suppression: 0.2 } },
    { interventions: ['dust_suppression'], assumptions: JSON.parse('{"__proto__": {"pm10": 0.1}}') },
  ];
  for (const payload of cases) {
    const res = await runWith(payload);
    assert.equal(res.status, 400, JSON.stringify(payload));
    assert.equal((await res.json()).error.code, 'INVALID_ASSUMPTIONS');
  }
  assert.equal(stub.calls.length, 0);
});

test('combined reductions never exceed 100%', () => {
  const all = combineReductions(INTERVENTION_IDS);
  for (const r of Object.values(all)) assert.ok(r > 0 && r < 1);
});

test('insufficient baseline data -> no AQI values invented', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm2_5: null, pm10: null });
  const body = await run(['dust_suppression']);
  assert.equal(body.status, 'insufficient_data');
  assert.equal(body.baselineAQI, null);
  assert.equal(body.scenarioAQI, null);
  assert.equal(body.aqiChange, null);
});
