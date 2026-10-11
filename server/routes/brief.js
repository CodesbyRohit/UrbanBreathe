import { Router } from 'express';
import { generateExecutiveBrief } from '../services/briefGenerator.js';
import { getFallbackData } from '../services/openMeteoService.js';
import { calculateSourceAttribution } from '../services/sourceAttribution.js';
import { generateForecast } from '../services/forecastService.js';
import { runSimulation, getInterventions } from '../services/simulationEngine.js';
import { resolveCity, validateInterventionIds } from '../http/validation.js';

const router = Router();

router.post('/generate', (req, res, next) => {
  try {
    const { cityId } = resolveCity(req.body?.cityId);
    const interventions = req.body?.interventions === undefined
      ? []
      : validateInterventionIds(req.body.interventions, getInterventions().map(iv => iv.id), { min: 0 });

    const data = getFallbackData(cityId);
    const sources = calculateSourceAttribution(data);
    const forecast = generateForecast(data, cityId);
    let simulation = null;
    if (interventions && interventions.length > 0) {
      simulation = runSimulation(data, interventions);
    }
    const brief = generateExecutiveBrief(cityId, data, sources, forecast, simulation);
    res.json(brief);
  } catch (err) {
    next(err);
  }
});

export default router;
