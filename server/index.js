import { pathToFileURL } from 'node:url';
import app from './app.js';

// Export for Vercel serverless or start server directly
export default app;

// Only start listening when this file is run directly (`node server/index.js`),
// not when it is imported (Vercel entry point, tests).
const isVercel = process.env.VERCEL === '1';
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (!isVercel && isMain) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`UrbanBreathe API server running on port ${PORT}`);
  });
}
