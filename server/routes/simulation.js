import { Router } from 'express';
import { runSimulation, getInterventions } from '../services/simulationEngine.js';
import { getFallbackData } from '../services/openMeteoService.js';
import { resolveCity, validateInterventionIds } from '../http/validation.js';

const router = Router();

router.get('/interventions', (req, res) => {
  res.json(getInterventions());
});

router.post('/run', (req, res, next) => {
  try {
    const { cityId } = resolveCity(req.body?.cityId);
    const interventions = validateInterventionIds(req.body?.interventions, getInterventions().map(iv => iv.id));
    const data = getFallbackData(cityId);
    // Derive aqi from PM2.5 if not present in fallback data
    const cityData = { ...data, aqi: data.aqi || Math.round((data.pm25 || 60) * 1.5), cityId };
    const result = runSimulation(cityData, interventions);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
