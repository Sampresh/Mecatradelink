import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { publicUser, startSession, BCRYPT_COST } from './auth.controller.js';
import { revokeAllRefreshTokens } from '../services/token.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { paginate, pageMeta } from '../lib/pagination.js';

export async function updateProfile(req, res) {
  const { name, phone, company } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(company !== undefined && { company: company || null }),
    },
  });
  ok(res, publicUser(user), 'Profile updated');
}

export async function changePassword(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(req.body.newPassword, BCRYPT_COST), passwordChangedAt: new Date() },
  });
  await revokeAllRefreshTokens(user.id);
  // Every other session is now dead; give this device a fresh one.
  ok(res, await startSession(res, updated), 'Password changed. Other devices have been signed out.');
}

export async function myEnquiries(req, res) {
  const pg = paginate(req.validatedQuery);
  const where = { userId: req.user.id };
  const [items, total] = await Promise.all([
    prisma.enquiry.findMany({
      where, orderBy: { createdAt: 'desc' }, take: pg.take, skip: pg.skip,
      include: { items: true },
    }),
    prisma.enquiry.count({ where }),
  ]);
  ok(res, items, 'OK', pageMeta(pg, total));
}

export async function myEnquiry(req, res) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  // adminNote is internal.
  const { adminNote, ...rest } = enquiry;
  ok(res, rest);
}
