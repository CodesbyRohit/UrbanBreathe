import { once } from 'node:events';
import app from '../../server/app.js';

const realFetch = globalThis.fetch;

/** Start the Express app on an ephemeral local port. */
export async function startServer() {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise(resolve => server.close(resolve)),
  };
}

/** Call the local test server (always uses the real fetch, never the stub). */
export function api(baseUrl, path, init) {
  return realFetch(`${baseUrl}${path}`, init);
}

/**
 * Replace global fetch for upstream (non-local) requests with `handler(url, init)`.
 * Local requests to the test server still use the real fetch.
 * Returns a restore function and the list of upstream URLs requested.
 */
export function stubUpstreamFetch(handler) {
  const calls = [];
  globalThis.fetch = (input, init) => {
    const url = String(input);
    if (url.startsWith('http://127.0.0.1')) return realFetch(input, init);
    calls.push(url);
    return handler(url, init);
  };
  return {
    calls,
    restore: () => { globalThis.fetch = realFetch; },
  };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
