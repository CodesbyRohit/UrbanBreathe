import { Router } from 'express';
import { calculateSourceAttribution } from '../services/sourceAttribution.js';
import { getFallbackData } from '../services/openMeteoService.js';

const router = Router();

router.get('/:cityId', (req, res) => {
  try {
    const { cityId } = req.params;
    const data = getFallbackData(cityId);
    const attribution = calculateSourceAttribution(data);
    res.json(attribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
