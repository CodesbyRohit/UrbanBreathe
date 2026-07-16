import { Router } from 'express';
import { runSimulation, getInterventions } from '../services/simulationEngine.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

router.get('/interventions', (req, res) => {
  res.json(getInterventions());
});

router.post('/run', (req, res) => {
  try {
    const { cityId, interventions } = req.body;
    if (!cityId || !interventions) {
      return res.status(400).json({ error: 'cityId and interventions required' });
    }
    const data = getFallbackData(cityId);
    const cityData = { ...data, aqi: data.pm25 ? undefined : 150, cityId };
    const result = runSimulation(cityData, interventions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
