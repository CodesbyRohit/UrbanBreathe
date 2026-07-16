import { Router } from 'express';
import { getCombinedCityData } from '../services/openMeteoService.js';

const router = Router();

router.get('/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }
    const data = await getCombinedCityData(cityId, parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
