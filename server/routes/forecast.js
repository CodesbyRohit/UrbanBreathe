import { Router } from 'express';
import { cityParam } from '../http/validation.js';
import { generateForecast } from '../services/forecastService.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

router.get('/:cityId', cityParam, (req, res, next) => {
  try {
    const cityId = req.city.id;
    const data = getFallbackData(cityId);
    const forecast = generateForecast(data, cityId);
    res.json(forecast);
  } catch (err) {
    next(err);
  }
});

export default router;
