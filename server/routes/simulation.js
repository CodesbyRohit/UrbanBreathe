import { Router } from 'express';
import { getInterventions, runScenario, INTERVENTION_IDS } from '../services/scenario.js';
import { loadCityContext } from '../services/cityAirQuality.js';
import { resolveCity, validateInterventionIds } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.get('/interventions', (req, res) => {
  res.json(getInterventions());
});

router.post('/run', asyncHandler(async (req, res) => {
  const city = resolveCity(req.body?.cityId);
  const ids = validateInterventionIds(req.body?.interventions, INTERVENTION_IDS);
  const ctx = await loadCityContext(city);
  res.json(runScenario(ctx, ids));
}));

export default router;
