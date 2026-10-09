import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

// requireOwnership('enquiry') — 404s unless req.params.id belongs to req.user (admins pass).
const OWNED = {
  enquiry: (id) => prisma.enquiry.findUnique({ where: { id }, select: { userId: true } }),
};

export const requireOwnership = (model) => async (req, res, next) => {
  const record = await OWNED[model](req.params.id);
  // 404 rather than 403 so ids belonging to other users are not confirmed to exist.
  if (!record || (record.userId !== req.user.id && req.user.role !== 'ADMIN')) {
    return next(ApiError.notFound());
  }
  next();
};
