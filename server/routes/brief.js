import { Router } from 'express';
import { generateExecutiveBrief } from '../services/briefGenerator.js';
import { getFallbackData } from '../services/openMeteoService.js';
import { calculateSourceAttribution } from '../services/sourceAttribution.js';
import { generateForecast } from '../services/forecastService.js';
import { runSimulation } from '../services/simulationEngine.js';

const router = Router();

router.post('/generate', (req, res) => {
  try {
    const { cityId, interventions } = req.body;
    if (!cityId) return res.status(400).json({ error: 'cityId required' });

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
    res.status(500).json({ error: err.message });
  }
});

export default router;
