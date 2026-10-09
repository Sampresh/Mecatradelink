import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { notFound, errorHandler } from './middleware/errorHandler.middleware.js';
import { UPLOAD_DIR } from './services/upload.service.js';
import apiRoutes from './routes/index.js';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.set('trust proxy', env.TRUST_PROXY);
app.disable('x-powered-by');

if (env.FORCE_HTTPS) {
  app.use((req, res, next) => {
    if (req.secure || req.path === '/health') return next();
    res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  });
}

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
// No payment webhooks in this project, so no express.raw() routes are mounted here.
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up', uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

// Local-disk uploads (dev fallback). express.static rejects traversal outside UPLOAD_DIR.
app.use('/uploads', express.static(UPLOAD_DIR, { dotfiles: 'deny', index: false, maxAge: '7d' }));

app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);
