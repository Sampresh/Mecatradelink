import { z } from 'zod';

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug').max(120);
const bool = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean());
const optText = (max) => z.string().trim().max(max).optional().or(z.literal('')).transform((v) => v || null);
const httpsUrl = z.string().trim().url().max(500).startsWith('https://', 'URL must use https');
const optHttpsUrl = httpsUrl.optional().or(z.literal('')).transform((v) => v || null);
const id = z.string().min(1).max(40);

export const idParam = z.object({ id });
export const imageParams = z.object({ id, imageId: id });
export const slugParam = z.object({ slug });

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().max(100).optional(),
  category: slug.optional(),
  brand: slug.optional(),
  featured: bool.optional(),
  sort: z.enum(['newest', 'name']).default('newest'),
});

export const adminProductQuerySchema = productQuerySchema.extend({
  status: z.enum(['all', 'active', 'inactive']).default('all'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slug.optional(),
  description: optText(500),
  icon: optText(40),
  imageUrl: optHttpsUrl,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: slug.optional(),
  sku: optText(60),
  model: optText(120),
  brandId: id.nullable().optional().or(z.literal('')).transform((v) => v || null),
  summary: optText(300),
  description: z.string().max(10_000).optional().or(z.literal('')),
  specs: z.array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) })).max(30).default([]),
  unit: z.enum(['piece', 'box', 'pack', 'roll', 'coil', 'metre', 'set']).default('piece'),
  categoryId: z.string().min(1).max(40),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productSchema.partial();

export const imageUploadQuerySchema = z.object({ sample: bool.optional() });

export const imageOrderSchema = z.object({ ids: z.array(id).min(1).max(50) });
export const imageAltSchema = z.object({ alt: optText(150) });

export const brandSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slug.optional(),
  description: optText(600),
  website: optHttpsUrl,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  categoryIds: z.array(id).max(50).default([]),
});

export const GALLERY_CATEGORIES = ['SHOWROOM', 'PRODUCTS', 'STOCK', 'PROJECTS', 'INSTALLATIONS', 'COMPANY'];
export const galleryQuerySchema = z.object({ category: z.enum(GALLERY_CATEGORIES).optional() });
export const galleryUploadSchema = z.object({
  category: z.enum(GALLERY_CATEGORIES),
  caption: optText(200),
});
export const galleryUpdateSchema = z.object({
  category: z.enum(GALLERY_CATEGORIES).optional(),
  caption: optText(200),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});
