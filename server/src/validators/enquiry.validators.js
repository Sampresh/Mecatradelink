import { z } from 'zod';

const contact = {
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254).optional().or(z.literal('')),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, 'Enter a valid phone number').optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
};

// Many customers prefer to be called, so either a phone number or an email is enough.
const reachable = (d) => Boolean(d.phone || d.email);
const reachableIssue = { message: 'Enter a phone number or an email so we can reply', path: ['phone'] };

export const contactEnquirySchema = z.object({
  ...contact,
  message: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(3000),
}).refine(reachable, reachableIssue);

export const quoteEnquirySchema = z.object({
  ...contact,
  message: z.string().trim().max(3000).optional().or(z.literal('')),
  items: z
    .array(z.object({ productId: z.string().min(1).max(40), quantity: z.coerce.number().int().min(1).max(1_000_000) }))
    .min(1, 'Add at least one product')
    .max(50),
}).refine(reachable, reachableIssue);

export const enquiryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED']).optional(),
  type: z.enum(['CONTACT', 'QUOTE']).optional(),
});

export const enquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED']).optional(),
  adminNote: z.string().trim().max(3000).optional(),
});
