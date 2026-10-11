import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, api } from '../helpers/server.js';

test('GET /api/health returns JSON status', async () => {
  const srv = await startServer();
  try {
    const res = await api(srv.baseUrl, '/api/health');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'healthy');
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
  } finally {
    await srv.close();
  }
});
