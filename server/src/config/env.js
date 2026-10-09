import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Server-local .env wins, then the repo-root .env (shared with docker-compose).
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

const REQUIRED = ['DATABASE_URL', 'CLIENT_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

const stripSlash = (v) => (v ? v.replace(/\/+$/, '') : v);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5001,
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: stripSlash(process.env.CLIENT_URL),
  SERVER_PUBLIC_URL: stripSlash(process.env.SERVER_PUBLIC_URL) || `http://localhost:${Number(process.env.PORT) || 5001}`,
  FORCE_HTTPS: process.env.FORCE_HTTPS === 'true',
  // Number of reverse-proxy hops in front of the API (Render = 1). 0 = use the socket address.
  // Must match reality: too high lets clients spoof X-Forwarded-For past the rate limiter.
  TRUST_PROXY: Number(process.env.TRUST_PROXY ?? (process.env.NODE_ENV === 'production' ? 1 : 0)),
  // Shared secret the Next.js server sends so SSR fetches are not rate limited as one IP.
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || null,
  // Website origin the API notifies after admin edits (POST /api/revalidate). Server-to-server URL.
  REVALIDATE_URL: stripSlash(process.env.REVALIDATE_URL) || stripSlash(process.env.CLIENT_URL),

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'no-reply@localhost',
  FROM_NAME: process.env.FROM_NAME || 'Meca Trade Link',
  ENQUIRY_NOTIFY_EMAIL: process.env.ENQUIRY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'mecatradelink',
};

env.isProd = env.NODE_ENV === 'production';

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[env] Missing required variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  for (const k of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (env[k].length < 32) console.warn(`[env] ${k} is shorter than 32 characters`);
  }

  if (env.isProd) {
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      console.error('[env] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ in production');
      process.exit(1);
    }
    if (!env.INTERNAL_API_KEY || env.INTERNAL_API_KEY.length < 32) {
      console.warn('[env] INTERNAL_API_KEY missing/short — SSR traffic shares one rate-limit bucket');
    }
    if (!env.SMTP_HOST) console.warn('[env] SMTP_HOST not set — emails will only be logged');
    if (!env.CLOUDINARY_CLOUD_NAME) console.warn('[env] Cloudinary not configured — uploads go to local disk (ephemeral on Render)');
  }
}
