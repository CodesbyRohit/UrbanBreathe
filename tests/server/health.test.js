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

test('GET /api/health reports the deployed commit when Vercel provides it', async () => {
  const saved = { sha: process.env.VERCEL_GIT_COMMIT_SHA, env: process.env.VERCEL_ENV };
  const srv = await startServer();
  try {
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_ENV;
    let body = await (await api(srv.baseUrl, '/api/health')).json();
    assert.deepEqual(body.deployment, { commit: null, environment: null });

    process.env.VERCEL_GIT_COMMIT_SHA = '714a20561aec0df0f6cd0886fb4a738e45db6f78';
    process.env.VERCEL_ENV = 'production';
    body = await (await api(srv.baseUrl, '/api/health')).json();
    assert.deepEqual(body.deployment, { commit: '714a20561aec0df0f6cd0886fb4a738e45db6f78', environment: 'production' });
  } finally {
    for (const [k, v] of [['VERCEL_GIT_COMMIT_SHA', saved.sha], ['VERCEL_ENV', saved.env]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    await srv.close();
  }
});
