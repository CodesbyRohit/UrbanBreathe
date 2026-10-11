import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provenanceBadge, formatIndex, formatValue, formatCityTime } from '../../src/utils/provenance.ts';

const LIVE_WORDS = /\blive\b|real-?time|sensor/i;

test('demo/fixture data is always labelled DEMO and never live', () => {
  const variants = [
    { mode: 'demo' as const, airQuality: { kind: 'demo' } },
    { mode: 'demo' as const, airQuality: { kind: 'modelled' } }, // mode wins
    { mode: 'live' as const, airQuality: { kind: 'demo' } }, // kind wins
  ];
  for (const p of variants) {
    const b = provenanceBadge(p);
    assert.equal(b.isDemo, true);
    assert.equal(b.text, 'DEMO DATA');
    assert.doesNotMatch(`${b.text} ${b.detail}`, LIVE_WORDS);
  }
});

test('modelled data is labelled as a modelled estimate, not live sensor data', () => {
  const b = provenanceBadge({ mode: 'live', airQuality: { kind: 'modelled', attribution: 'Air quality: CAMS global forecast via Open-Meteo (CC BY 4.0)' } });
  assert.equal(b.tone, 'modelled');
  assert.equal(b.isDemo, false);
  assert.doesNotMatch(`${b.text} ${b.detail}`, LIVE_WORDS);
});

test('missing provenance is shown as unknown, not as live', () => {
  const b = provenanceBadge(undefined);
  assert.equal(b.tone, 'unknown');
  assert.doesNotMatch(b.text, LIVE_WORDS);
});

test('formatIndex handles null and open-ended Severe', () => {
  assert.equal(formatIndex(null), '--');
  assert.equal(formatIndex(undefined), '--');
  assert.equal(formatIndex(134), '134');
  assert.equal(formatIndex(401, true), '401+');
});

test('formatValue never turns missing values into 0', () => {
  assert.equal(formatValue(null), '--');
  assert.equal(formatValue(0), '0');
  assert.equal(formatValue(63.25, 1), '63.3');
});

test('formatCityTime renders IST regardless of process TZ', () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'UTC';
    const a = formatCityTime('2026-10-11T13:30:00.000Z');
    process.env.TZ = 'America/New_York';
    const b = formatCityTime('2026-10-11T13:30:00.000Z');
    assert.equal(a, b);
    assert.match(a, /11 Oct/);
    assert.match(a, /7:00\s?pm IST/i);
  } finally {
    if (original === undefined) delete process.env.TZ; else process.env.TZ = original;
  }
});
