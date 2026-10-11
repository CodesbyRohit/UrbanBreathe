import { Router } from 'express';
import { loadCityContext, toAirQualityResponse } from '../services/cityAirQuality.js';
import { cityParam, checkOptionalCoordinates } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.get('/:cityId', cityParam, asyncHandler(async (req, res) => {
  checkOptionalCoordinates(req.query, req.city);
  const ctx = await loadCityContext(req.city);
  res.json(toAirQualityResponse(ctx));
}));

export default router;
