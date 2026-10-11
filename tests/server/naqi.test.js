import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  subIndexFor, computeNaqi, windowAverage, categoryForIndex, aggregateSubIndices,
} from '../../server/domain/naqi.js';

const REF = '2026-10-11T12:00:00.000Z';

/** Hourly points ending at REF (inclusive), oldest first. */
function hourly(values, ref = REF) {
  const end = Date.parse(ref);
  return values.map((value, i) => ({
    time: new Date(end - (values.length - 1 - i) * 3600_000).toISOString(),
    value,
  }));
}
const flat = (value, hours) => hourly(Array(hours).fill(value));

describe('sub-index (CPCB CUPS/82/2014-15 Table 3.11)', () => {
  test('PM2.5 band edges and interpolation', () => {
    assert.equal(subIndexFor('pm25', 0).subIndex, 0);
    assert.equal(subIndexFor('pm25', 30).subIndex, 50);
    // §3.5: ILO is reduced by one above the Good band, so 31 maps to 50, not 51.
    assert.equal(subIndexFor('pm25', 31).subIndex, 50);
    assert.equal(subIndexFor('pm25', 45).subIndex, 74); // (50/29)*14 + 50 = 74.14
    assert.equal(subIndexFor('pm25', 61).subIndex, 100);
    assert.equal(subIndexFor('pm25', 60).subIndex, 100);
    assert.equal(subIndexFor('pm25', 90).subIndex, 200);
    assert.equal(subIndexFor('pm25', 120).subIndex, 300);
    assert.equal(subIndexFor('pm25', 250).subIndex, 400);
  });

  test('values between published integer bands are rounded, not dropped to 0', () => {
    // Regression: the old calculator returned 0 for 30 < x < 31.
    assert.equal(subIndexFor('pm25', 30.4).subIndex, 50);
    assert.equal(subIndexFor('pm25', 30.6).subIndex, 50); // rounds to 31 -> 50
  });

  test('PM10 and NO2 edges', () => {
    assert.equal(subIndexFor('pm10', 100).subIndex, 100);
    assert.equal(subIndexFor('pm10', 250).subIndex, 200);
    assert.equal(subIndexFor('pm10', 430).subIndex, 400);
    assert.equal(subIndexFor('no2', 80).subIndex, 100);
    assert.equal(subIndexFor('no2', 400).subIndex, 400);
  });

  test('CO is evaluated in mg/m³ with one-decimal breakpoints', () => {
    assert.equal(subIndexFor('co', 1.0).subIndex, 50);
    assert.equal(subIndexFor('co', 1.1).subIndex, 50);
    assert.equal(subIndexFor('co', 10).subIndex, 200);
    assert.equal(subIndexFor('co', 34).subIndex, 400);
  });

  test('O3 8-hour and SO2 edges', () => {
    assert.equal(subIndexFor('o3', 100).subIndex, 100);
    assert.equal(subIndexFor('o3', 748).subIndex, 400);
    assert.equal(subIndexFor('so2', 1600).subIndex, 400);
  });

  test('open-ended Severe band returns 401 as a lower bound', () => {
    for (const [p, c] of [['pm25', 251], ['pm10', 431], ['o3', 749], ['co', 34.2], ['so2', 1601]]) {
      const r = subIndexFor(p, c);
      assert.equal(r.subIndex, 401, p);
      assert.equal(r.isLowerBound, true, p);
      assert.equal(r.category, 'Severe', p);
    }
  });

  test('invalid concentrations return null', () => {
    assert.equal(subIndexFor('pm25', -1), null);
    assert.equal(subIndexFor('pm25', NaN), null);
    assert.equal(subIndexFor('pm25', null), null);
    assert.equal(subIndexFor('pm25', '40'), null);
    assert.throws(() => subIndexFor('benzene', 1), /Unknown/);
  });

  test('categories follow the CPCB index ranges', () => {
    assert.equal(categoryForIndex(50), 'Good');
    assert.equal(categoryForIndex(51), 'Satisfactory');
    assert.equal(categoryForIndex(200), 'Moderate');
    assert.equal(categoryForIndex(300), 'Poor');
    assert.equal(categoryForIndex(400), 'Very Poor');
    assert.equal(categoryForIndex(401), 'Severe');
    assert.equal(categoryForIndex(null), null);
  });
});

describe('averaging windows', () => {
  test('running mean over the window ending at the reference hour', () => {
    const r = windowAverage(hourly([10, 20, 30]), REF, 2);
    assert.equal(r.average, 25);
    assert.equal(r.validHours, 2);
  });

  test('points after the reference time are ignored (no future leakage)', () => {
    const future = { time: '2026-10-11T13:00:00.000Z', value: 1000 };
    const r = windowAverage([...flat(10, 24), future], REF, 24);
    assert.equal(r.average, 10);
  });

  test('null, negative and non-finite values are skipped and counted', () => {
    const r = windowAverage(hourly([10, null, -5, NaN, 30]), REF, 5);
    assert.equal(r.average, 20);
    assert.equal(r.validHours, 2);
    assert.equal(r.invalidValues, 2); // -5 and NaN; null is "missing", not invalid
  });

  test('duplicate timestamps are counted once', () => {
    const pts = [...flat(10, 1), { time: REF, value: 30 }];
    assert.equal(windowAverage(pts, REF, 1).validHours, 1);
  });
});

describe('overall NAQI requirements', () => {
  const complete = {
    pm25: { unit: 'ug/m3', points: flat(45, 24) },
    no2: { unit: 'ug/m3', points: flat(40, 24) },
    o3: { unit: 'ug/m3', points: flat(100, 8) },
  };

  test('maximum sub-index is the AQI; dominant pollutant reported', () => {
    const r = computeNaqi(complete, REF);
    assert.equal(r.status, 'ok');
    assert.equal(r.value, 100);
    assert.deepEqual(r.dominantPollutants, ['o3']);
    assert.equal(r.category, 'Satisfactory');
    assert.equal(r.subIndices.pm25.subIndex, 74);
  });

  test('fewer than three pollutants -> insufficient_data, no value', () => {
    const r = computeNaqi({ pm25: complete.pm25, no2: complete.no2 }, REF);
    assert.equal(r.status, 'insufficient_data');
    assert.equal(r.value, null);
    assert.match(r.reasons.join(' '), /at least 3/);
  });

  test('three pollutants without PM2.5/PM10 -> insufficient_data', () => {
    const r = computeNaqi({
      no2: complete.no2, o3: complete.o3, so2: { unit: 'ug/m3', points: flat(20, 24) },
    }, REF);
    assert.equal(r.status, 'insufficient_data');
    assert.match(r.reasons.join(' '), /PM2\.5 or PM10/);
  });

  test('24-hour sub-index needs at least 16 valid hours', () => {
    const with15 = hourly([...Array(9).fill(null), ...Array(15).fill(45)]);
    const with16 = hourly([...Array(8).fill(null), ...Array(16).fill(45)]);
    assert.equal(computeNaqi({ ...complete, pm25: { unit: 'ug/m3', points: with15 } }, REF).subIndices.pm25.status, 'insufficient_data');
    assert.equal(computeNaqi({ ...complete, pm25: { unit: 'ug/m3', points: with16 } }, REF).subIndices.pm25.status, 'ok');
  });

  test('8-hour sub-index requires all 8 hours (conservative; CPCB minimum not stated)', () => {
    const seven = hourly([null, ...Array(7).fill(100)]);
    const r = computeNaqi({ ...complete, o3: { unit: 'ug/m3', points: seven } }, REF);
    assert.equal(r.subIndices.o3.status, 'insufficient_data');
    assert.equal(r.subIndices.o3.requiredHours, 8);
  });

  test('missing pollutants are simply absent; invalid-only series is insufficient', () => {
    const r = computeNaqi({ ...complete, so2: { unit: 'ug/m3', points: flat(null, 24) } }, REF);
    assert.equal(r.status, 'ok');
    assert.equal(r.subIndices.so2.status, 'insufficient_data');
    assert.equal(r.subIndices.co, undefined);
  });

  test('CO supplied in µg/m³ is converted to mg/m³ before lookup', () => {
    const r = computeNaqi({ ...complete, co: { unit: 'ug/m3', points: flat(547, 8) } }, REF);
    assert.equal(r.subIndices.co.unit, 'mg/m3');
    assert.equal(r.subIndices.co.average, 0.55); // reported with one extra decimal
    assert.equal(r.subIndices.co.subIndex, 25); // 0.547 rounds to 0.5 mg/m³ -> (50/1.0)*0.5
  });

  test('Severe propagates as a lower bound', () => {
    const r = computeNaqi({ ...complete, pm25: { unit: 'ug/m3', points: flat(300, 24) } }, REF);
    assert.equal(r.value, 401);
    assert.equal(r.isLowerBound, true);
    assert.equal(r.category, 'Severe');
  });

  test('empty input -> insufficient_data', () => {
    const r = aggregateSubIndices({});
    assert.equal(r.status, 'insufficient_data');
    assert.equal(r.value, null);
  });
});

describe('regression: live Delhi CAMS values (11 Oct 2026, D1)', () => {
  // Old code reported AQI 360 for these inputs because the live value was replaced by
  // the fallback-derived AQI. With constant hourly values the NAQI must follow the
  // CPCB breakpoints for these concentrations.
  test('flat series at the observed CAMS concentrations', () => {
    const r = computeNaqi({
      pm25: { unit: 'ug/m3', points: flat(63.3, 24) },
      pm10: { unit: 'ug/m3', points: flat(152.3, 24) },
      no2: { unit: 'ug/m3', points: flat(29.2, 24) },
      o3: { unit: 'ug/m3', points: flat(101, 8) },
      so2: { unit: 'ug/m3', points: flat(32.9, 24) },
      co: { unit: 'ug/m3', points: flat(547, 8) },
    }, REF);
    // Hand-computed from Table 3.11 and the §3.5 formula (ILO - 1 above Good),
    // concentrations rounded to table precision:
    //   PM10 152 -> (100/149)*(152-101)+100 = 134.2 -> 134
    //   PM2.5 63 -> (100/29)*(63-61)+100   = 106.9 -> 107
    //   O3 101 -> 100; NO2 29 -> 36.25 -> 36; SO2 33 -> 41.25 -> 41; CO 0.5 mg/m³ -> 25
    assert.equal(r.status, 'ok');
    assert.equal(r.subIndices.pm10.subIndex, 134);
    assert.equal(r.subIndices.pm25.subIndex, 107);
    assert.equal(r.subIndices.o3.subIndex, 100);
    assert.equal(r.subIndices.no2.subIndex, 36);
    assert.equal(r.subIndices.so2.subIndex, 41);
    assert.equal(r.subIndices.co.subIndex, 25);
    assert.equal(r.value, 134);
    assert.deepEqual(r.dominantPollutants, ['pm10']);
    assert.equal(r.category, 'Moderate');
    assert.notEqual(r.value, 360);
  });
});
