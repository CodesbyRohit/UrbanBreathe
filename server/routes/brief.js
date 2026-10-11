import { Router } from 'express';
import { loadCityContext } from '../services/cityAirQuality.js';
import { generateBrief } from '../services/brief.js';
import { INTERVENTION_IDS } from '../services/scenario.js';
import { resolveCity, validateInterventionIds } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.post('/generate', asyncHandler(async (req, res) => {
  const city = resolveCity(req.body?.cityId);
  const interventions = req.body?.interventions === undefined
    ? []
    : validateInterventionIds(req.body.interventions, INTERVENTION_IDS, { min: 0 });
  const ctx = await loadCityContext(city);
  res.json(generateBrief(ctx, interventions));
}));

export default router;
