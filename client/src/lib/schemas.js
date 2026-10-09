import { z } from 'zod';

// Client-side mirrors of the server's zod validators (server remains the source of truth).
const optional = (s) => s.optional().or(z.literal(''));

export const contactShape = {
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: optional(z.string().trim().email('Enter a valid email')),
  phone: optional(z.string().trim().max(30).regex(/^[+\d\s()-]*$/, 'Enter a valid phone number')),
  company: optional(z.string().trim().max(120)),
  location: optional(z.string().trim().max(120)),
};

// A phone number or an email is enough for the sales team to reply.
const reachable = [(d) => Boolean(d.phone || d.email), { message: 'Enter a phone number or an email', path: ['phone'] }];

export const contactSchema = z
  .object({ ...contactShape, message: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(3000) })
  .refine(...reachable);

export const quoteSchema = z.object({ ...contactShape, message: optional(z.string().trim().max(3000)) }).refine(...reachable);

export const enquireSchema = z
  .object({
    name: contactShape.name,
    phone: contactShape.phone,
    email: contactShape.email,
    quantity: z.coerce.number().int().min(1, 'At least 1').max(1_000_000),
    message: optional(z.string().trim().max(1000)),
  })
  .refine(...reachable);

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/\d/, 'Include a number');

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const plainName = z.string().trim().min(2, 'Name is too short').max(100).regex(/^[^<>]*$/, 'Must not contain < or >');

export const registerSchema = z
  .object({
    name: plainName,
    email: z.string().trim().email('Enter a valid email'),
    phone: contactShape.phone,
    company: contactShape.company,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const emailSchema = z.object({ email: z.string().trim().email('Enter a valid email') });

export const resetSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const profileSchema = z.object({
  name: plainName,
  phone: contactShape.phone,
  company: contactShape.company,
});

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, 'Required'), newPassword: password, confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
