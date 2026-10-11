import express from 'express';
import cors from 'cors';
import airQualityRouter from './routes/airQuality.js';
import sourcesRouter from './routes/sources.js';
import forecastRouter from './routes/forecast.js';
import simulationRouter from './routes/simulation.js';
import briefRouter from './routes/brief.js';
import advisoryRouter from './routes/advisory.js';
import citiesRouter from './routes/cities.js';
import { apiNotFound, errorHandler } from './http/errors.js';

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// API routes
app.use('/api/cities', citiesRouter);
app.use('/api/air-quality', airQualityRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/brief', briefRouter);
app.use('/api/advisory', advisoryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api', apiNotFound);
app.use(errorHandler);

export default app;
