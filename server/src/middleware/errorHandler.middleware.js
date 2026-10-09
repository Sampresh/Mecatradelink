import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { status = 409; message = 'A record with this value already exists'; }
    else if (err.code === 'P2025') { status = 404; message = 'Record not found'; }
    else if (err.code === 'P2003') { status = 409; message = 'Record is still referenced by other data'; }
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 10 MB or smaller'
      : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Too many images in one upload'
      : err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Malformed JSON body';
  } else if (!(err instanceof ApiError) && status < 500) {
    // Unknown errors with a 4xx status (e.g. body-parser) keep their message.
  }

  if (status >= 500) {
    logger.error(err.stack || err.message);
    if (env.isProd) { message = 'Something went wrong. Please try again later.'; details = undefined; }
  }

  res.status(status).json({
    success: false,
    message,
    ...(details && { errors: details }),
    ...(!env.isProd && status >= 500 && { stack: err.stack }),
  });
}
