import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rankCities } from '../../src/utils/ranking.ts';
import { parseReductionPercent, buildAssumptions, toPercentText } from '../../src/utils/scenarioInputs.ts';
import { buildForecastRows, valueRange } from '../../src/utils/forecastSeries.ts';
import { project, labelSides, kmToMapUnits } from '../../src/utils/mapProjection.ts';
import { parseRoute, formatRoute } from '../../src/utils/route.ts';
import { formatAge, hoursOld, formatConcentration, formatAxisTime } from '../../src/utils/provenance.ts';

describe('city ranking', () => {
  const rows = [
    { cityName: 'Patna', aqi: null, isLowerBound: false },
    { cityName: 'Delhi', aqi: 401, isLowerBound: true },
    { cityName: 'Mumbai', aqi: 401, isLowerBound: false },
    { cityName: 'Chennai', aqi: 80, isLowerBound: false },
    { cityName: 'Agra', aqi: null, isLowerBound: false },
  ];

  test('highest first; "401+" ranks above an exact 401; no estimate last (by name)', () => {
    assert.deepEqual(rankCities(rows, 'aqi_desc').map(r => r.cityName), ['Delhi', 'Mumbai', 'Chennai', 'Agra', 'Patna']);
  });

  test('lowest first still keeps cities without an estimate last', () => {
    assert.deepEqual(rankCities(rows, 'aqi_asc').map(r => r.cityName), ['Chennai', 'Mumbai', 'Delhi', 'Agra', 'Patna']);
  });

  test('does not mutate its input', () => {
    const copy = rows.map(r => r.cityName);
    rankCities(rows, 'name');
    assert.deepEqual(rows.map(r => r.cityName), copy);
  });
});

describe('scenario inputs', () => {
  test('percent text is parsed and bounded like the server (0–90 %)', () => {
    assert.deepEqual(parseReductionPercent('35'), { fraction: 0.35 });
    assert.deepEqual(parseReductionPercent('0'), { fraction: 0 });
    assert.deepEqual(parseReductionPercent('12.5'), { fraction: 0.125 });
    for (const bad of ['', ' ', 'abc', '-1', '91', 'Infinity']) {
      assert.ok('error' in parseReductionPercent(bad), bad);
    }
  });

  test('round-trips default fractions without float noise', () => {
    assert.equal(toPercentText(0.35), '35');
    assert.equal(toPercentText(0.12), '12');
  });

  const defaults = { dust_suppression: { pm10: 0.25, pm25: 0.1 }, odd_even: { no2: 0.25 } };

  test('only edits that differ from the defaults are sent, as full replacement maps', () => {
    assert.deepEqual(buildAssumptions(['dust_suppression'], defaults, {}), {});
    assert.deepEqual(buildAssumptions(['dust_suppression'], defaults, { dust_suppression: { pm10: '25' } }), {});
    assert.deepEqual(
      buildAssumptions(['dust_suppression'], defaults, { dust_suppression: { pm10: '50' } }),
      { dust_suppression: { pm10: 0.5, pm25: 0.1 } },
    );
  });

  test('edits for unselected interventions are ignored; invalid input blocks the run', () => {
    assert.deepEqual(buildAssumptions(['odd_even'], defaults, { dust_suppression: { pm10: '50' } }), {});
    assert.equal(buildAssumptions(['dust_suppression'], defaults, { dust_suppression: { pm10: '95' } }), null);
  });
});

describe('forecast chart rows', () => {
  const pt = (h: number, naqi: number | null) => ({
    time: new Date(Date.UTC(2026, 9, 20, 12 + h)).toISOString(), hoursAhead: h, naqi, naqiIsLowerBound: false, category: null, pm25: null,
  });

  test('recent and forecast values are kept in separate columns, joined at the current hour', () => {
    const rows = buildForecastRows([pt(-1, 150), pt(0, 160)], [pt(1, 170), pt(2, null)]);
    assert.deepEqual(rows.map(r => r.hoursAhead), [-1, 0, 1, 2]);
    assert.deepEqual(rows.map(r => r.recent), [150, 160, null, null]);
    assert.deepEqual(rows.map(r => r.forecast), [null, 160, 170, null]);
    assert.deepEqual(rows.map(r => r.segment), ['recent', 'recent', 'forecast', 'forecast']);
  });

  test('range ignores missing estimates', () => {
    assert.deepEqual(valueRange([pt(1, 120), pt(2, null), pt(3, 90)]), { min: 90, max: 120 });
    assert.equal(valueRange([pt(1, null)]), null);
  });
});

describe('map projection', () => {
  test('matches the outline: Kanyakumari lands on the southern tip of the path', () => {
    const p = project(8.08, 77.54);
    assert.ok(Math.abs(p.x - 135.62) < 1 && Math.abs(p.y - 467.56) < 1, JSON.stringify(p));
  });

  test('labels of close neighbours are placed on opposite sides', () => {
    const pts = [
      { id: 'mumbai', ...project(19.076, 72.8777) },
      { id: 'pune', ...project(18.5204, 73.8567) },
      { id: 'bengaluru', ...project(12.9716, 77.5946) },
      { id: 'chennai', ...project(13.0827, 80.2707) },
      { id: 'kolkata', ...project(22.5726, 88.3639) },
    ];
    const sides = labelSides(pts);
    assert.equal(sides.mumbai, 'left');
    assert.equal(sides.pune, 'right');
    assert.equal(sides.bengaluru, 'left');
    assert.equal(sides.chennai, 'right');
    assert.equal(sides.kolkata, 'right');
  });

  test('scale bar length reflects east-west distance at the given latitude', () => {
    // 500 km at 22°N is ~4.85° of longitude -> ~62.5 of 400 map units.
    assert.ok(Math.abs(kmToMapUnits(500, 22) - 62.5) < 1);
  });
});

describe('route', () => {
  const sections = ['dashboard', 'forecast'];
  const fallback = { section: 'dashboard', cityId: 'delhi' };

  test('parses section and city, falling back for unknown or unsafe values', () => {
    assert.deepEqual(parseRoute('#forecast/mumbai', sections, fallback), { section: 'forecast', cityId: 'mumbai' });
    assert.deepEqual(parseRoute('#nope/<script>', sections, fallback), fallback);
    assert.deepEqual(parseRoute('', sections, fallback), fallback);
    assert.equal(formatRoute({ section: 'forecast', cityId: 'pune' }), '#forecast/pune');
  });
});

describe('time and unit formatting', () => {
  const now = Date.parse('2026-10-20T16:41:00Z');

  test('retrieval age and data age', () => {
    assert.equal(formatAge('2026-10-20T16:40:45Z', now), 'just now');
    assert.equal(formatAge('2026-10-20T16:29:00Z', now), '12 min ago');
    assert.equal(formatAge(null, now), 'unknown');
    assert.equal(hoursOld('2026-10-20T13:41:00Z', now), 3);
    assert.equal(hoursOld('not a date', now), null);
  });

  test('concentrations carry their unit and missing values stay "--"', () => {
    assert.equal(formatConcentration(63.34, 'ug/m3'), '63.3 µg/m³');
    assert.equal(formatConcentration(0.547, 'mg/m3', 2), '0.55 mg/m³');
    assert.equal(formatConcentration(null, 'ug/m3'), '--');
  });

  test('axis times are in the city time zone, independent of the runtime zone', () => {
    assert.equal(formatAxisTime('2026-10-20T16:00:00Z', 'Asia/Kolkata'), '20 Oct 21:30');
  });
});
