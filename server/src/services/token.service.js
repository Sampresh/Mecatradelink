import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { randomToken, sha256 } from '../lib/hash.js';
import ms from '../lib/ms.js';

const ALG = 'HS256';

// "pv" (password version) ties the token to the current password; changing it kills old tokens.
export const passwordVersion = (user) => user.passwordChangedAt?.getTime() ?? 0;

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, pv: passwordVersion(user) }, env.JWT_ACCESS_SECRET, {
    algorithm: ALG,
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [ALG] });

// Refresh tokens are signed JWTs whose hash is stored, so they can be rotated and revoked.
export async function issueRefreshToken(userId) {
  const token = jwt.sign({ sub: userId, jti: randomToken() }, env.JWT_REFRESH_SECRET, {
    algorithm: ALG,
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
  await prisma.refreshToken.create({
    data: { tokenHash: sha256(token), userId, expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRY)) },
  });
  return token;
}

/**
 * Validates and rotates a refresh token. Reuse of a revoked token revokes the whole family
 * for that user (likely theft). Returns { userId, refreshToken } or null.
 */
export async function rotateRefreshToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [ALG] });
  } catch {
    return null;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!stored || stored.userId !== payload.sub) return null;

  if (stored.revokedAt) {
    await revokeAllRefreshTokens(stored.userId);
    return null;
  }
  if (stored.expiresAt < new Date()) return null;

  // Claim the token atomically so concurrent requests cannot both rotate it.
  const claimed = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (claimed.count !== 1) return null;

  const next = await issueRefreshToken(stored.userId);
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { replacedBy: sha256(next) } });
  return { userId: stored.userId, refreshToken: next };
}

export async function revokeRefreshToken(token) {
  if (!token) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export const revokeAllRefreshTokens = (userId) =>
  prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

// One-time email tokens (verification, password reset). Only the hash is stored.
export async function createEmailToken(userId, type, ttlMs) {
  const token = randomToken();
  await prisma.emailToken.deleteMany({ where: { userId, type, usedAt: null } });
  await prisma.emailToken.create({
    data: { tokenHash: sha256(token), type, userId, expiresAt: new Date(Date.now() + ttlMs) },
  });
  return token;
}

export async function consumeEmailToken(token, type) {
  const record = await prisma.emailToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) return null;
  // Atomic single use: only one concurrent request can flip usedAt.
  const claimed = await prisma.emailToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: new Date() } });
  return claimed.count === 1 ? record.userId : null;
}
