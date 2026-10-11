// Pollutant unit handling.
//
// Gas conversions between volume mixing ratio (ppb/ppm) and mass concentration
// use the conventional reference conditions of 25 °C and 1 atm, where one mole
// of an ideal gas occupies 24.45 L:
//   µg/m³ = ppb × MW / 24.45      mg/m³ = ppm × MW / 24.45
// See docs/methodology/naqi.md for the caveat on reference conditions.

export const MOLAR_VOLUME_L = 24.45;

// Molecular weights in g/mol.
export const MOLECULAR_WEIGHT = {
  no2: 46.0055,
  o3: 47.9982,
  so2: 64.066,
  co: 28.010,
  nh3: 17.031,
};

export const SUPPORTED_UNITS = ['ug/m3', 'mg/m3', 'ppb', 'ppm'];

// Units used by the CPCB National AQI breakpoint table (CUPS/82/2014-15, Table 3.11).
export const CPCB_UNITS = {
  pm10: 'ug/m3',
  pm25: 'ug/m3',
  no2: 'ug/m3',
  o3: 'ug/m3',
  co: 'mg/m3',
  so2: 'ug/m3',
  nh3: 'ug/m3',
  pb: 'ug/m3',
};

function isUsableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Convert a value to µg/m³. Returns null for null/non-finite input. */
function toMicrograms(value, unit, parameter) {
  switch (unit) {
    case 'ug/m3': return value;
    case 'mg/m3': return value * 1000;
    case 'ppb':
    case 'ppm': {
      const mw = MOLECULAR_WEIGHT[parameter];
      if (!mw) throw new Error(`Cannot convert ${unit} for "${parameter}": not a gas with a known molecular weight`);
      const ppb = unit === 'ppm' ? value * 1000 : value;
      return (ppb * mw) / MOLAR_VOLUME_L;
    }
    default:
      throw new Error(`Unsupported unit "${unit}"`);
  }
}

function fromMicrograms(value, unit, parameter) {
  switch (unit) {
    case 'ug/m3': return value;
    case 'mg/m3': return value / 1000;
    case 'ppb':
    case 'ppm': {
      const mw = MOLECULAR_WEIGHT[parameter];
      if (!mw) throw new Error(`Cannot convert to ${unit} for "${parameter}": not a gas with a known molecular weight`);
      const ppb = (value * MOLAR_VOLUME_L) / mw;
      return unit === 'ppm' ? ppb / 1000 : ppb;
    }
    default:
      throw new Error(`Unsupported unit "${unit}"`);
  }
}

/**
 * Convert a concentration between units.
 * Returns null when `value` is null, undefined or not a finite number.
 * Throws for unsupported units or impossible conversions (e.g. PM2.5 in ppb).
 */
export function convertConcentration(value, fromUnit, toUnit, parameter) {
  if (!SUPPORTED_UNITS.includes(fromUnit)) throw new Error(`Unsupported unit "${fromUnit}"`);
  if (!SUPPORTED_UNITS.includes(toUnit)) throw new Error(`Unsupported unit "${toUnit}"`);
  if (!isUsableNumber(value)) return null;
  if (fromUnit === toUnit) return value;
  return fromMicrograms(toMicrograms(value, fromUnit, parameter), toUnit, parameter);
}

/** Convert a concentration to the unit used by the CPCB NAQI breakpoint table. */
export function toCpcbUnit(parameter, value, unit) {
  const target = CPCB_UNITS[parameter];
  if (!target) throw new Error(`Unknown NAQI parameter "${parameter}"`);
  return convertConcentration(value, unit, target, parameter);
}
