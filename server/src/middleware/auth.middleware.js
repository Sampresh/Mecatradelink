import { prisma } from '../config/db.js';
import { verifyAccessToken, passwordVersion } from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';

const USER_SELECT = {
  id: true, name: true, email: true, role: true, phone: true, company: true, emailVerifiedAt: true, passwordChangedAt: true,
};

// Tokens minted before the last password change carry an old "pv" and are rejected.
const issuedBeforePasswordChange = (payload, user) => payload.pv !== passwordVersion(user);

// Re-reads the user from the database so role changes and deletions take effect immediately.
export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized('Authentication required'));

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: USER_SELECT });
  if (!user) return next(ApiError.unauthorized('Account no longer exists'));
  if (issuedBeforePasswordChange(payload, user)) return next(ApiError.unauthorized('Session expired'));
  req.user = user;
  next();
}

// Attaches req.user when a valid token is present; never rejects.
export async function optionalAuth(req, res, next) {
  if (!req.headers.authorization) return next();
  try {
    const payload = verifyAccessToken(req.headers.authorization.replace(/^Bearer /, ''));
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: USER_SELECT });
    if (user && !issuedBeforePasswordChange(payload, user)) req.user = user;
  } catch {
    // ignore — treated as anonymous
  }
  next();
}
