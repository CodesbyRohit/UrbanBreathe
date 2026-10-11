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
