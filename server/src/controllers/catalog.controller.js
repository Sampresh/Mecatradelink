import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { paginate, pageMeta } from '../lib/pagination.js';

const IMAGE_SELECT = { id: true, url: true, alt: true };
const COVER = { select: IMAGE_SELECT, orderBy: { sortOrder: 'asc' }, take: 1 };
export const BRAND_REF = { select: { id: true, name: true, slug: true, logoUrl: true } };

export const PRODUCT_CARD = {
  id: true, name: true, slug: true, model: true, summary: true, unit: true, isFeatured: true,
  category: { select: { name: true, slug: true } },
  brand: BRAND_REF,
  images: COVER,
};

// Cards expose the cover as `imageUrl` so clients don't need to know about the images table.
export const toCard = ({ images, ...p }) => ({ ...p, imageUrl: images?.[0]?.url ?? null });

export function buildProductWhere({ q, category, brand, featured }, base = {}) {
  return {
    ...base,
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
    ...(featured !== undefined && { isFeatured: featured }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };
}

// ── Categories ───────────────────────────────────────────────
export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  ok(res, categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })));
}

export async function getCategory(req, res) {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { brands: { ...BRAND_REF, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
  });
  if (!category) throw ApiError.notFound('Category not found');
  ok(res, category);
}

// ── Brands ───────────────────────────────────────────────────
const BRAND_PUBLIC = {
  id: true, name: true, slug: true, description: true, website: true, logoUrl: true,
  categories: { select: { id: true, name: true, slug: true }, orderBy: { sortOrder: 'asc' } },
  _count: { select: { products: { where: { isActive: true } } } },
};
const withCount = ({ _count, ...b }) => ({ ...b, productCount: _count.products });

export async function listBrands(req, res) {
  const brands = await prisma.brand.findMany({ select: BRAND_PUBLIC, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  ok(res, brands.map(withCount));
}

export async function getBrand(req, res) {
  const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug }, select: BRAND_PUBLIC });
  if (!brand) throw ApiError.notFound('Brand not found');
  ok(res, withCount(brand));
}

// ── Products ─────────────────────────────────────────────────
export async function listProducts(req, res) {
  const query = req.validatedQuery;
  const pg = paginate(query);
  const where = buildProductWhere(query, { isActive: true });
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, select: PRODUCT_CARD, take: pg.take, skip: pg.skip,
      orderBy: query.sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);
  ok(res, items.map(toCard), 'OK', pageMeta(pg, total));
}

export async function getProduct(req, res) {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true, logoUrl: true, website: true } },
      images: { select: IMAGE_SELECT, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, NOT: { id: product.id } },
    select: PRODUCT_CARD, take: 4, orderBy: { isFeatured: 'desc' },
  });
  ok(res, { ...product, imageUrl: product.images[0]?.url ?? null, related: related.map(toCard) });
}

// ── Gallery ──────────────────────────────────────────────────
export async function listGallery(req, res) {
  const { category } = req.validatedQuery;
  const images = await prisma.galleryImage.findMany({
    where: category ? { category } : {},
    select: { id: true, url: true, width: true, height: true, caption: true, category: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 500,
  });
  ok(res, images);
}

// Lightweight index for the sitemap.
export async function sitemapEntries(req, res) {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  ok(res, { products, categories, brands });
}
