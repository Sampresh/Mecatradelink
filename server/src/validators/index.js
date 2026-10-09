import { ApiError } from '../utils/ApiError.js';

// validate({ body, query, params }) — parses and replaces each part with the zod output.
export const validate = (schemas) => (req, res, next) => {
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(ApiError.badRequest(details[0]?.message || 'Validation failed', details));
    }
    // Express 5 exposes req.query as a getter, so store parsed values separately.
    if (part === 'query') req.validatedQuery = result.data;
    else req[part] = result.data;
  }
  next();
};

export * from './auth.validators.js';
export * from './catalog.validators.js';
export * from './enquiry.validators.js';
