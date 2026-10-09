import slugify from 'slugify';

export const toSlug = (text) => slugify(text, { lower: true, strict: true, trim: true });
