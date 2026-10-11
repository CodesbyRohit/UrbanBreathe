import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api, stubUpstreamFetch } from '../helpers/server.js';

let srv;
let stub;
before(async () => {
  // Validation must reject requests before any upstream call is made.
  stub = stubUpstreamFetch(url => { throw new Error(`unexpected upstream call: ${url}`); });
  srv = await startServer();
});
after(async () => {
  await srv.close();
  stub.restore();
});

const postJson = (path, body) => api(srv.baseUrl, path, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

async function expectError(res, status, code) {
  assert.equal(res.status, status);
  assert.match(res.headers.get('content-type') || '', /application\/json/);
  const body = await res.json();
  assert.equal(body.error.code, code);
  assert.equal(typeof body.error.message, 'string');
  assert.doesNotMatch(JSON.stringify(body), /at\s+\S+\s+\(|node_modules|\\Users\\/); // no stack traces or paths
  return body;
}

describe('unknown and invalid cities', () => {
  for (const path of ['/api/air-quality/xyz', '/api/forecast/xyz', '/api/sources/xyz', '/api/advisory/nowhere', '/api/cities/xyz']) {
    test(`GET ${path} -> 404 CITY_NOT_FOUND (no silent Delhi fallback)`, async () => {
      await expectError(await api(srv.baseUrl, path), 404, 'CITY_NOT_FOUND');
    });
  }

  test('malformed city id -> 400', async () => {
    await expectError(await api(srv.baseUrl, '/api/forecast/DROP%20TABLE'), 400, 'INVALID_CITY_ID');
  });

  test('POST bodies with unknown city -> 404', async () => {
    await expectError(await postJson('/api/brief/generate', { cityId: 'atlantis' }), 404, 'CITY_NOT_FOUND');
    await expectError(await postJson('/api/simulation/run', { cityId: 'atlantis', interventions: ['odd_even'] }), 404, 'CITY_NOT_FOUND');
  });

  test('POST bodies without cityId -> 400', async () => {
    await expectError(await postJson('/api/brief/generate', {}), 400, 'INVALID_CITY_ID');
    await expectError(await postJson('/api/simulation/run', { interventions: ['odd_even'] }), 400, 'INVALID_CITY_ID');
  });
});

describe('coordinates', () => {
  test('non-numeric lat -> 400 (previously silent fallback with 200)', async () => {
    await expectError(await api(srv.baseUrl, '/api/air-quality/delhi?lat=abc&lon=77'), 400, 'INVALID_COORDINATES');
  });
  test('lat without lon -> 400', async () => {
    await expectError(await api(srv.baseUrl, '/api/air-quality/delhi?lat=28.6'), 400, 'INVALID_COORDINATES');
  });
  test('out-of-range lat -> 400', async () => {
    await expectError(await api(srv.baseUrl, '/api/air-quality/delhi?lat=128.6&lon=77.2'), 400, 'INVALID_COORDINATES');
  });
  test('coordinates of another place -> 400 COORDINATES_MISMATCH', async () => {
    await expectError(await api(srv.baseUrl, '/api/air-quality/delhi?lat=51.5&lon=-0.12'), 400, 'COORDINATES_MISMATCH');
  });
});

describe('intervention payloads', () => {
  const cases = [
    ['string instead of array', 'x'],
    ['empty array', []],
    ['unknown id', ['teleport_smog']],
    ['non-string id', [42]],
    ['duplicate ids', ['odd_even', 'odd_even']],
    ['too many ids', Array(9).fill('odd_even')],
    ['missing', undefined],
  ];
  for (const [name, interventions] of cases) {
    test(`${name} -> 400 INVALID_INTERVENTIONS`, async () => {
      await expectError(await postJson('/api/simulation/run', { cityId: 'delhi', interventions }), 400, 'INVALID_INTERVENTIONS');
    });
  }
  test('brief rejects invalid optional interventions', async () => {
    await expectError(await postJson('/api/brief/generate', { cityId: 'delhi', interventions: 'x' }), 400, 'INVALID_INTERVENTIONS');
  });
});

describe('malformed requests and unknown routes', () => {
  test('malformed JSON -> 400 JSON error without stack trace', async () => {
    await expectError(await postJson('/api/brief/generate', '{bad'), 400, 'INVALID_JSON');
  });
  test('oversized JSON body -> 413', async () => {
    const big = JSON.stringify({ cityId: 'delhi', pad: 'x'.repeat(20_000) });
    await expectError(await postJson('/api/brief/generate', big), 413, 'PAYLOAD_TOO_LARGE');
  });
  test('unknown API route -> 404 JSON', async () => {
    await expectError(await api(srv.baseUrl, '/api/nope'), 404, 'ROUTE_NOT_FOUND');
  });
  test('X-Powered-By header is not sent', async () => {
    const res = await api(srv.baseUrl, '/api/cities');
    assert.equal(res.headers.get('x-powered-by'), null);
  });
  test('no upstream calls were made by invalid requests', () => {
    assert.deepEqual(stub.calls, []);
  });
});
