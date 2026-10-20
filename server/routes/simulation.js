import { Router } from 'express';
import {
  getInterventions, runScenario, INTERVENTION_IDS, SCENARIO_POLLUTANTS, MAX_REDUCTION,
} from '../services/scenario.js';
import { loadCityContext } from '../services/cityAirQuality.js';
import { resolveCity, validateInterventionIds, validateAssumptions } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.get('/interventions', (req, res) => {
  res.json(getInterventions());
});

router.post('/run', asyncHandler(async (req, res) => {
  const city = resolveCity(req.body?.cityId);
  const ids = validateInterventionIds(req.body?.interventions, INTERVENTION_IDS);
  const assumptions = validateAssumptions(req.body?.assumptions, ids, SCENARIO_POLLUTANTS, MAX_REDUCTION);
  const ctx = await loadCityContext(city);
  res.json(runScenario(ctx, ids, assumptions));
}));

export default router;
