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
import { getCorsOrigins } from './config.js';

// Successful GET responses may be cached by Vercel's CDN for 60 s (plus 60 s
// stale-while-revalidate) via Vercel-CDN-Cache-Control, which only the CDN
// reads. Browsers get `no-cache` (always revalidate), so a browser never shows
// an older response than the CDN — otherwise the header and the (uncached,
// POST) brief could describe different hours. Every payload carries its own
// referenceTime / retrievedAt. Errors and POST responses are not cached.
export const API_CACHE_CONTROL = 'no-cache';
export const API_CDN_CACHE_CONTROL = 'max-age=60, stale-while-revalidate=60';

const app = express();

app.disable('x-powered-by');

// CORS is opt-in (CORS_ORIGINS); the UI calls the API from the same origin.
const corsOrigins = getCorsOrigins();
if (corsOrigins.length) app.use('/api', cors({ origin: corsOrigins, methods: ['GET', 'POST'] }));

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.method === 'GET' && req.path !== '/api/health') {
    res.set('Cache-Control', API_CACHE_CONTROL);
    res.set('Vercel-CDN-Cache-Control', API_CDN_CACHE_CONTROL);
  } else {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

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
