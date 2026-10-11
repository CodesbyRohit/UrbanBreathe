import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { requestJson, ApiError } from '../../src/services/http.ts';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

/** A fetch that never resolves until its signal aborts. */
function hangingFetch() {
  globalThis.fetch = ((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  })) as typeof fetch;
}

test('timeout applies even when the caller passes its own signal (regression)', async () => {
  hangingFetch();
  const caller = new AbortController();
  const started = Date.now();
  await assert.rejects(
    requestJson('/api/x', {}, { signal: caller.signal, timeoutMs: 30 }),
    (err: unknown) => err instanceof ApiError && err.code === 'TIMEOUT',
  );
  assert.ok(Date.now() - started < 1000);
});

test('caller abort is propagated as an AbortError, not a timeout', async () => {
  hangingFetch();
  const caller = new AbortController();
  const p = requestJson('/api/x', {}, { signal: caller.signal, timeoutMs: 5000 });
  caller.abort();
  await assert.rejects(p, (err: unknown) => err instanceof DOMException && err.name === 'AbortError');
});

test('server JSON errors surface their message and code', async () => {
  globalThis.fetch = (async () => new Response(
    JSON.stringify({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Open-Meteo air-quality data is unavailable (HTTP 500).' } }),
    { status: 503, headers: { 'content-type': 'application/json' } },
  )) as typeof fetch;
  await assert.rejects(requestJson('/api/x'), (err: unknown) =>
    err instanceof ApiError && err.status === 503 && err.code === 'UPSTREAM_UNAVAILABLE' && /unavailable/.test(err.message));
});

test('successful JSON responses are returned', async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ ok: 1 }), { status: 200 })) as typeof fetch;
  assert.deepEqual(await requestJson('/api/x'), { ok: 1 });
});
