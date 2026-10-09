import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email').max(254);
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');
const plainText = (max) => z.string().trim().max(max).regex(/^[^<>]*$/, 'Must not contain < or >');
const phone = z.string().trim().max(30).regex(/^[+\d\s()-]*$/, 'Enter a valid phone number').optional().or(z.literal(''));

export const registerSchema = z.object({
  name: plainText(100).pipe(z.string().min(2, 'Name is too short')),
  email,
  password,
  phone,
  company: plainText(120).optional().or(z.literal('')),
});

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required').max(128) });
export const emailOnlySchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid token') });
export const resetPasswordSchema = tokenSchema.extend({ password });

export const updateProfileSchema = z.object({
  name: plainText(100).pipe(z.string().min(2, 'Name is too short')).optional(),
  phone,
  company: plainText(120).optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: password,
});
