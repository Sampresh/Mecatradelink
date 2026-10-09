import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { REFRESH_COOKIE, refreshCookieOptions } from '../config/cookies.js';
import {
  signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllRefreshTokens,
  createEmailToken, consumeEmailToken,
} from '../services/token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';

const BCRYPT_COST = 12;
const VERIFY_TTL = 24 * 60 * 60 * 1000;
const RESET_TTL = 60 * 60 * 1000;
const FREE_ATTEMPTS = 5;
const MAX_LOCK_MINUTES = 60;
// Compared against when the email is unknown so response time does not reveal registered accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', BCRYPT_COST);

const publicUser = ({ id, name, email, role, phone, company, emailVerifiedAt }) => ({
  id, name, email, role, phone, company, emailVerified: Boolean(emailVerifiedAt),
});

async function startSession(res, user) {
  const refreshToken = await issueRefreshToken(user.id);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return { accessToken: signAccessToken(user), user: publicUser(user) };
}

export async function register(req, res) {
  const { name, email, password, phone, company } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });

  // Hash unconditionally and send email without awaiting so timing does not reveal existing accounts.
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  if (!existing) {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone: phone || null, company: company || null },
    });
    sendVerificationEmail(user, await createEmailToken(user.id, 'VERIFY_EMAIL', VERIFY_TTL));
  } else if (!existing.emailVerifiedAt) {
    sendVerificationEmail(existing, await createEmailToken(existing.id, 'VERIFY_EMAIL', VERIFY_TTL));
  }

  // Same response either way: no account enumeration.
  created(res, null, 'Check your inbox to verify your email address.');
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60_000);
    throw ApiError.tooMany(`Too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
  }

  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    if (user) {
      // Atomic increment so parallel guesses are all counted.
      const { failedLoginAttempts: attempts } = await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true },
      });
      const over = attempts - FREE_ATTEMPTS;
      if (over > 0) {
        // Progressive lockout: 1, 2, 4, 8 … minutes, capped.
        const lockedUntil = new Date(Date.now() + Math.min(2 ** (over - 1), MAX_LOCK_MINUTES) * 60_000);
        await prisma.user.update({ where: { id: user.id }, data: { lockedUntil } });
      }
    }
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.emailVerifiedAt) {
    const err = ApiError.forbidden('Please verify your email before logging in.');
    err.details = [{ code: 'EMAIL_NOT_VERIFIED' }];
    throw err;
  }

  if (user.failedLoginAttempts || user.lockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  ok(res, await startSession(res, user), 'Logged in');
}

export async function refresh(req, res) {
  const rotated = await rotateRefreshToken(req.cookies?.[REFRESH_COOKIE]);
  if (!rotated) {
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
    throw ApiError.unauthorized('Session expired');
  }
  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user) throw ApiError.unauthorized('Session expired');

  res.cookie(REFRESH_COOKIE, rotated.refreshToken, refreshCookieOptions());
  ok(res, { accessToken: signAccessToken(user), user: publicUser(user) });
}

export async function logout(req, res) {
  await revokeRefreshToken(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
  ok(res, null, 'Logged out');
}

export async function verifyEmail(req, res) {
  const userId = await consumeEmailToken(req.body.token, 'VERIFY_EMAIL');
  if (!userId) throw ApiError.badRequest('This verification link is invalid or has expired.');
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  ok(res, null, 'Email verified. You can now log in.');
}

export async function resendVerification(req, res) {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user && !user.emailVerifiedAt) {
    sendVerificationEmail(user, await createEmailToken(user.id, 'VERIFY_EMAIL', VERIFY_TTL));
  }
  ok(res, null, 'If that account needs verification, a new link is on its way.');
}

export async function forgotPassword(req, res) {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user) sendPasswordResetEmail(user, await createEmailToken(user.id, 'RESET_PASSWORD', RESET_TTL));
  ok(res, null, 'If an account exists for that email, a reset link has been sent.');
}

export async function resetPassword(req, res) {
  const userId = await consumeEmailToken(req.body.token, 'RESET_PASSWORD');
  if (!userId) throw ApiError.badRequest('This reset link is invalid or has expired.');
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(req.body.password, BCRYPT_COST),
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
      // Clicking the emailed link proves ownership of the address.
      emailVerifiedAt: new Date(),
    },
  });
  await revokeAllRefreshTokens(userId);
  ok(res, null, 'Password updated. Please log in.');
}

export async function me(req, res) {
  ok(res, publicUser(req.user));
}

export { publicUser, startSession, BCRYPT_COST };
