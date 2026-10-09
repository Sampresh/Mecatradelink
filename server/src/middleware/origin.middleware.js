import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * CSRF guard for the cookie-authenticated endpoints (refresh, logout). Everything else
 * authenticates with a Bearer header, which browsers never attach automatically.
 * Browsers always send Origin on cross-origin POSTs; requests without it (curl, server
 * jobs) carry no ambient browser cookies to abuse.
 */
export function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (origin && origin !== env.CLIENT_URL) return next(ApiError.forbidden('Cross-origin request blocked'));
  if (req.get('sec-fetch-site') === 'cross-site') return next(ApiError.forbidden('Cross-site request blocked'));
  next();
}
