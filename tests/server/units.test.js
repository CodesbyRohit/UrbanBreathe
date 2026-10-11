import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertConcentration, toCpcbUnit } from '../../server/domain/units.js';

const close = (actual, expected, tol = 1e-3) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('mass units: mg/m³ <-> µg/m³', () => {
  assert.equal(convertConcentration(1.8, 'mg/m3', 'ug/m3', 'co'), 1800);
  assert.equal(convertConcentration(547, 'ug/m3', 'mg/m3', 'co'), 0.547);
});

test('ppb -> µg/m³ uses MW / 24.45 (25 °C, 1 atm)', () => {
  close(convertConcentration(1, 'ppb', 'ug/m3', 'no2'), 46.0055 / 24.45);
  close(convertConcentration(100, 'ppb', 'ug/m3', 'o3'), (100 * 47.9982) / 24.45);
  close(convertConcentration(10, 'ppb', 'ug/m3', 'so2'), (10 * 64.066) / 24.45);
});

test('ppm CO -> mg/m³', () => {
  close(convertConcentration(1, 'ppm', 'mg/m3', 'co'), 28.010 / 24.45);
});

test('round trip ppb -> µg/m³ -> ppb', () => {
  const ug = convertConcentration(42, 'ppb', 'ug/m3', 'no2');
  close(convertConcentration(ug, 'ug/m3', 'ppb', 'no2'), 42);
});

test('particulate matter cannot be expressed in ppb', () => {
  assert.throws(() => convertConcentration(10, 'ppb', 'ug/m3', 'pm25'), /molecular weight/);
});

test('unsupported units throw', () => {
  assert.throws(() => convertConcentration(10, 'grains', 'ug/m3', 'pm25'), /Unsupported unit/);
});

test('null, undefined and non-finite values convert to null, never 0', () => {
  assert.equal(convertConcentration(null, 'ug/m3', 'mg/m3', 'co'), null);
  assert.equal(convertConcentration(undefined, 'ug/m3', 'mg/m3', 'co'), null);
  assert.equal(convertConcentration(NaN, 'ug/m3', 'mg/m3', 'co'), null);
  assert.equal(convertConcentration('12', 'ug/m3', 'mg/m3', 'co'), null);
});

test('toCpcbUnit converts CO to mg/m³ and keeps others in µg/m³', () => {
  assert.equal(toCpcbUnit('co', 547, 'ug/m3'), 0.547);
  assert.equal(toCpcbUnit('pm25', 63.3, 'ug/m3'), 63.3);
  assert.throws(() => toCpcbUnit('benzene', 1, 'ug/m3'), /Unknown NAQI parameter/);
});
