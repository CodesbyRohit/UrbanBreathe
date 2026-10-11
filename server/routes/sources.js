import { Router } from 'express';
import { cityParam } from '../http/validation.js';
import { calculateSourceAttribution } from '../services/sourceAttribution.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

router.get('/:cityId', cityParam, (req, res, next) => {
  try {
    const cityId = req.city.id;
    const data = getFallbackData(cityId);
    const attribution = calculateSourceAttribution(data);
    res.json(attribution);
  } catch (err) {
    next(err);
  }
});

export default router;
