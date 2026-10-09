import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const json = (message) => ({ success: false, message });

const internalKey = env.INTERNAL_API_KEY && Buffer.from(env.INTERNAL_API_KEY);

// True only for the Next.js server (SSR/ISR), which calls the API from a few shared IPs.
export function isInternalRequest(req) {
  const given = req.get('x-internal-key');
  if (!internalKey || !given) return false;
  const buf = Buffer.from(given);
  return buf.length === internalKey.length && crypto.timingSafeEqual(buf, internalKey);
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip: isInternalRequest,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many requests, please slow down.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many attempts, please try again later.'),
});

export const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many enquiries sent. Please call us or try again later.'),
});
