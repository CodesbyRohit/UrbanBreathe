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
const getSources = async () => (await api(srv.baseUrl, '/api/sources/delhi')).json();

test('no source contribution percentages or confidence scores are produced', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await getSources();
  assert.equal(body.status, 'indicators_only');
  assert.equal(body.contributions, undefined);
  assert.equal(body.confidenceScores, undefined);
  assert.equal(body.sortedSources, undefined);
  for (const c of body.sourceCategories) {
    assert.deepEqual(Object.keys(c).sort(), ['description', 'mitigation', 'source']);
  }
  assert.match(body.disclaimer, /does not estimate how much each source contributes/);
});

test('PM2.5/PM10 ratio uses the 24-hour means from the live series', async () => {
  useValues(DELHI_CAMS_SAMPLE);
  const body = await getSources();
  const ratio = body.indicators.find(i => i.id === 'pm25_pm10_ratio');
  assert.equal(ratio.inputs.pm25, 63.3);
  assert.equal(ratio.inputs.pm10, 152.3);
  assert.equal(ratio.value, 0.42); // 63.3 / 152.3 = 0.4156
  assert.equal(ratio.basis, 'modelled');
  assert.match(ratio.caveat, /does not identify or quantify any source/);
});

test('indicators are unavailable (null), not guessed, when PM data are missing', async () => {
  useValues({ ...DELHI_CAMS_SAMPLE, pm10: null });
  const body = await getSources();
  const ratio = body.indicators.find(i => i.id === 'pm25_pm10_ratio');
  assert.equal(ratio.value, null);
  assert.ok(ratio.unavailableReason);
});
