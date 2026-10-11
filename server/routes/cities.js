import { Router } from 'express';
import { cities } from '../data/cities.js';
import { cityParam } from '../http/validation.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(cities);
});

router.get('/:cityId', cityParam, (req, res) => {
  res.json(req.city);
});

export default router;
