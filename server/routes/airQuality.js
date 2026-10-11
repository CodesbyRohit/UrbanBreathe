import { Router } from 'express';
import { getCombinedCityData } from '../services/openMeteoService.js';
import { detectAnomaly } from '../services/forecastService.js';
import { cityParam, checkOptionalCoordinates } from '../http/validation.js';
import { asyncHandler } from '../http/errors.js';

const router = Router();

router.get('/:cityId', cityParam, asyncHandler(async (req, res) => {
  const { city } = req;
  checkOptionalCoordinates(req.query, city);
  const data = await getCombinedCityData(city.id, city.lat, city.lon);

  // Attach real-time anomaly detection
  const anomaly = detectAnomaly(data, city.id);

  res.json({
    ...data,
    anomaly,
  });
}));

export default router;
