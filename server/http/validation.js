import { cityMap } from '../data/cities.js';
import { badRequest, notFound } from './errors.js';

const CITY_ID_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;
// Optional client-supplied coordinates must be within this distance (degrees) of
// the registered city centre; the server always uses its own coordinates.
const COORDINATE_TOLERANCE_DEG = 0.5;

/** Resolve a known city from a route/body value or throw 400/404. */
export function resolveCity(cityId) {
  if (typeof cityId !== 'string' || !CITY_ID_PATTERN.test(cityId)) {
    throw badRequest('INVALID_CITY_ID', 'cityId must be a lowercase identifier such as "delhi".');
  }
  const city = cityMap[cityId];
  if (!city) throw notFound('CITY_NOT_FOUND', `Unknown city "${cityId}".`);
  return city;
}

/** Middleware: attach req.city from the :cityId route parameter. */
export function cityParam(req, res, next) {
  try {
    req.city = resolveCity(req.params.cityId);
    next();
  } catch (err) {
    next(err);
  }
}

function parseCoordinate(raw, name, min, max) {
  if (Array.isArray(raw)) throw badRequest('INVALID_COORDINATES', `${name} must be given once.`);
  const value = Number(raw);
  if (typeof raw !== 'string' || raw.trim() === '' || !Number.isFinite(value) || value < min || value > max) {
    throw badRequest('INVALID_COORDINATES', `${name} must be a number between ${min} and ${max}.`);
  }
  return value;
}

/**
 * Optional lat/lon query parameters (kept for backward compatibility).
 * If supplied they must be valid and match the city; otherwise 400.
 */
export function checkOptionalCoordinates(query, city) {
  const hasLat = query.lat !== undefined;
  const hasLon = query.lon !== undefined;
  if (!hasLat && !hasLon) return;
  if (hasLat !== hasLon) throw badRequest('INVALID_COORDINATES', 'lat and lon must be supplied together.');
  const lat = parseCoordinate(query.lat, 'lat', -90, 90);
  const lon = parseCoordinate(query.lon, 'lon', -180, 180);
  if (Math.abs(lat - city.lat) > COORDINATE_TOLERANCE_DEG || Math.abs(lon - city.lon) > COORDINATE_TOLERANCE_DEG) {
    throw badRequest('COORDINATES_MISMATCH', `Coordinates do not match city "${city.id}".`);
  }
}

/** Validate a list of intervention ids against the known catalogue. */
export function validateInterventionIds(value, knownIds, { min = 1, max = 8 } = {}) {
  if (!Array.isArray(value)) {
    throw badRequest('INVALID_INTERVENTIONS', 'interventions must be an array of intervention ids.');
  }
  if (value.length < min || value.length > max) {
    throw badRequest('INVALID_INTERVENTIONS', `Select between ${min} and ${max} interventions.`);
  }
  const unknown = value.filter(id => typeof id !== 'string' || !knownIds.includes(id));
  if (unknown.length) {
    throw badRequest('INVALID_INTERVENTIONS', 'Unknown intervention id(s).', { unknown: unknown.map(String).slice(0, 10) });
  }
  if (new Set(value).size !== value.length) {
    throw badRequest('INVALID_INTERVENTIONS', 'Intervention ids must be unique.');
  }
  return value;
}

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Optional user-edited reduction fractions:
 *   { [interventionId]: { [pollutant]: fraction } }
 * Each entry replaces the placeholder map for that intervention. Ids must be
 * among the selected interventions, pollutants among `pollutants`, and each
 * fraction a number in [0, maxReduction].
 */
export function validateAssumptions(value, selectedIds, pollutants, maxReduction) {
  if (value === undefined) return {};
  const invalid = message => badRequest('INVALID_ASSUMPTIONS', message);
  if (!isPlainObject(value)) throw invalid('assumptions must be an object keyed by intervention id.');
  const out = {};
  for (const [id, reductions] of Object.entries(value)) {
    if (!selectedIds.includes(id)) throw invalid(`assumptions for "${String(id).slice(0, 40)}" do not match a selected intervention.`);
    if (!isPlainObject(reductions)) throw invalid(`assumptions.${id} must be an object of pollutant fractions.`);
    const entries = Object.entries(reductions);
    if (entries.length > pollutants.length) throw invalid(`assumptions.${id} has too many entries.`);
    out[id] = {};
    for (const [p, r] of entries) {
      if (!pollutants.includes(p)) throw invalid(`assumptions.${id}: unsupported pollutant "${String(p).slice(0, 20)}".`);
      if (typeof r !== 'number' || !Number.isFinite(r) || r < 0 || r > maxReduction) {
        throw invalid(`assumptions.${id}.${p} must be a number between 0 and ${maxReduction}.`);
      }
      out[id][p] = r;
    }
  }
  return out;
}
