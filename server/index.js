import { env, validateEnv } from './src/config/env.js';
import { connectDB, prisma } from './src/config/db.js';
import { logger } from './src/utils/logger.js';
// Static import so `node --watch` tracks every app module (dynamic imports aren't watched).
import { app } from './src/app.js';
import { triggerRevalidate } from './src/middleware/revalidate.middleware.js';

validateEnv();
await connectDB();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  // A restart can drop a pending post-edit refresh, and deploys may change data, so always
  // ask the website to drop its cached catalogue once the API is up.
  triggerRevalidate();
});

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
