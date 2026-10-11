import { Router } from 'express';
import { loadCityContext } from '../services/cityAirQuality.js';
import { buildAdvisory, ADVISORY_LANGUAGES } from '../services/advisory.js';
import { cityParam } from '../http/validation.js';
import { asyncHandler, badRequest } from '../http/errors.js';

const router = Router();

router.get('/:cityId', cityParam, asyncHandler(async (req, res) => {
  const lang = req.query.lang ?? 'en';
  if (!ADVISORY_LANGUAGES.includes(lang)) {
    throw badRequest('INVALID_LANGUAGE', `lang must be one of: ${ADVISORY_LANGUAGES.join(', ')}.`);
  }
  const ctx = await loadCityContext(req.city);
  res.json(buildAdvisory(ctx, lang));
}));

export default router;
