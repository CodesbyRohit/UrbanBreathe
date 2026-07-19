import { Router } from 'express';
import { getCombinedCityData } from '../services/openMeteoService.js';
import { detectAnomaly } from '../services/forecastService.js';

const router = Router();

router.get('/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }
    const data = await getCombinedCityData(cityId, parseFloat(lat), parseFloat(lon));

    // Attach real-time anomaly detection
    const anomaly = detectAnomaly(data, cityId);

    res.json({
      ...data,
      anomaly,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
