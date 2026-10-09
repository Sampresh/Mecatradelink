import crypto from 'node:crypto';

export const randomToken = () => crypto.randomBytes(32).toString('hex');
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
