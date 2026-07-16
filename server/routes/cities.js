import { Router } from 'express';
import { cities } from '../data/cities.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(cities);
});

router.get('/:id', (req, res) => {
  const city = cities.find(c => c.id === req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
});

export default router;
