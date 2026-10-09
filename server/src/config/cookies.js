import ms from '../lib/ms.js';
import { env } from './env.js';

export const REFRESH_COOKIE = 'mtl_rt';

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  // Client (apex) and API (api. subdomain) are same-site, so Strict still works for XHR
  // while never attaching the cookie to requests started from other sites.
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: ms(env.JWT_REFRESH_EXPIRY),
});
