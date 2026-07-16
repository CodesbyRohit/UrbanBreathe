import { Router } from 'express';
import { generateForecast } from '../services/forecastService.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

router.get('/:cityId', (req, res) => {
  try {
    const { cityId } = req.params;
    const data = getFallbackData(cityId);
    const forecast = generateForecast(data, cityId);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
