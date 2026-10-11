import { Router } from 'express';
import { loadCityContext } from '../services/cityAirQuality.js';
import { buildSourceContext } from '../services/sourceIndicators.js';
import { cityParam } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.get('/:cityId', cityParam, asyncHandler(async (req, res) => {
  const ctx = await loadCityContext(req.city);
  res.json(buildSourceContext(ctx));
}));

export default router;
