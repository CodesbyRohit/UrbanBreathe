import { Router } from 'express';
import { loadCityContext } from '../services/cityAirQuality.js';
import { generateBrief } from '../services/brief.js';
import { INTERVENTION_IDS, SCENARIO_POLLUTANTS, MAX_REDUCTION } from '../services/scenario.js';
import { resolveCity, validateInterventionIds, validateAssumptions } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.post('/generate', asyncHandler(async (req, res) => {
  const city = resolveCity(req.body?.cityId);
  const interventions = req.body?.interventions === undefined
    ? []
    : validateInterventionIds(req.body.interventions, INTERVENTION_IDS, { min: 0 });
  const assumptions = validateAssumptions(req.body?.assumptions, interventions, SCENARIO_POLLUTANTS, MAX_REDUCTION);
  const ctx = await loadCityContext(city);
  res.json(generateBrief(ctx, interventions, assumptions));
}));

export default router;
