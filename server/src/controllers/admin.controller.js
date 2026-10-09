import { prisma } from '../config/db.js';
import { toSlug } from '../lib/slug.js';
import { sanitizeRichText } from '../lib/sanitize.js';
import { paginate, pageMeta } from '../lib/pagination.js';
import { saveImage, deleteImage, deleteImages } from '../services/upload.service.js';
import { MAX_PRODUCT_IMAGES } from '../middleware/upload.middleware.js';
import { buildProductWhere } from './catalog.controller.js';
import { SAMPLE_SUFFIX, isSample } from '../lib/sampleImages.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created, noContent } from '../utils/ApiResponse.js';

// ── Dashboard ────────────────────────────────────────────────
export async function stats(req, res) {
  const [products, activeProducts, categories, brands, gallery, noPhoto, newEnquiries, openEnquiries, users, recent] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.galleryImage.count(),
    prisma.product.count({ where: { isActive: true, images: { none: {} } } }),
    prisma.enquiry.count({ where: { status: 'NEW' } }),
    prisma.enquiry.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { _count: { select: { items: true } } } }),
  ]);
  ok(res, { products, activeProducts, categories, brands, gallery, noPhoto, newEnquiries, openEnquiries, users, recent });
}

// ── Categories ───────────────────────────────────────────────
export async function createCategory(req, res) {
  const { slug, ...data } = req.body;
  const category = await prisma.category.create({ data: { ...data, slug: slug || toSlug(data.name) } });
  created(res, category);
}

export async function updateCategory(req, res) {
  const { slug, ...data } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { ...data, slug: slug || toSlug(data.name) },
  });
  ok(res, category);
}

export async function deleteCategory(req, res) {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (count) throw ApiError.conflict(`Move or delete the ${count} product(s) in this category first`);
  await prisma.category.delete({ where: { id: req.params.id } });
  noContent(res);
}

// ── Products ─────────────────────────────────────────────────
const ADMIN_IMAGES = { select: { id: true, url: true, alt: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } };

export async function listProducts(req, res) {
  const query = req.validatedQuery;
  const pg = paginate(query);
  const base = query.status === 'all' ? {} : { isActive: query.status === 'active' };
  const where = buildProductWhere(query, base);
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, take: pg.take, skip: pg.skip,
      orderBy: query.sort === 'name' ? { name: 'asc' } : { updatedAt: 'desc' },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { images: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);
  const rows = items.map(({ images, _count, ...p }) => ({ ...p, imageUrl: images[0]?.url ?? null, imageCount: _count.images }));
  ok(res, rows, 'OK', pageMeta(pg, total));
}

const getAdminProduct = (id) => prisma.product.findUnique({ where: { id }, include: { images: ADMIN_IMAGES } });

export async function getProduct(req, res) {
  const product = await getAdminProduct(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  ok(res, product);
}

const productData = ({ slug, description, ...rest }) => ({
  ...rest,
  ...(description !== undefined && { description: sanitizeRichText(description) || null }),
  ...((slug || rest.name) && { slug: slug || toSlug(rest.name) }),
});

export async function createProduct(req, res) {
  const product = await prisma.product.create({ data: productData(req.body), include: { images: ADMIN_IMAGES } });
  created(res, product);
}

export async function updateProduct(req, res) {
  const product = await prisma.product.update({
    where: { id: req.params.id }, data: productData(req.body), include: { images: ADMIN_IMAGES },
  });
  ok(res, product);
}

export async function deleteProduct(req, res) {
  const images = await prisma.productImage.findMany({ where: { productId: req.params.id }, select: { publicId: true } });
  await prisma.product.delete({ where: { id: req.params.id } });
  await deleteImages(images.map((i) => i.publicId));
  noContent(res);
}

// ── Product images ───────────────────────────────────────────
/** Saves files one by one; if any fails, already-saved files are removed again. */
async function saveAll(files, opts) {
  const saved = [];
  try {
    for (const file of files) saved.push(await saveImage(file, opts));
    return saved;
  } catch (err) {
    await deleteImages(saved.map((s) => s.publicId));
    throw err;
  }
}

// Re-number 0..n-1 so sortOrder 0 is always the cover.
async function renumber(productId) {
  const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { sortOrder: 'asc' }, select: { id: true } });
  await prisma.$transaction(images.map((img, i) => prisma.productImage.update({ where: { id: img.id }, data: { sortOrder: i } })));
}

async function findProductImage(req) {
  const image = await prisma.productImage.findFirst({ where: { id: req.params.imageId, productId: req.params.id } });
  if (!image) throw ApiError.notFound('Image not found');
  return image;
}

export async function addProductImages(req, res) {
  if (!req.files?.length) throw ApiError.badRequest('Choose at least one image');
  const sample = req.validatedQuery?.sample === true;
  const product = await prisma.product.findUnique({
    where: { id: req.params.id }, select: { name: true, images: { select: { id: true, alt: true, publicId: true } } },
  });
  if (!product) throw ApiError.notFound('Product not found');

  // Real photos replace any placeholder photos.
  const samples = sample ? [] : product.images.filter(isSample);
  const existing = product.images.length - samples.length;
  if (existing + req.files.length > MAX_PRODUCT_IMAGES) {
    throw ApiError.badRequest(`A product can have up to ${MAX_PRODUCT_IMAGES} photos (it has ${existing})`);
  }

  const saved = await saveAll(req.files, { folder: 'products', preset: 'product' });
  if (samples.length) {
    await prisma.productImage.deleteMany({ where: { id: { in: samples.map((s) => s.id) } } });
    await deleteImages(samples.map((s) => s.publicId));
    await renumber(req.params.id);
  }
  const alt = sample ? `${product.name}${SAMPLE_SUFFIX}` : product.name;
  await prisma.productImage.createMany({
    data: saved.map((s, i) => ({ productId: req.params.id, url: s.url, publicId: s.publicId, alt, sortOrder: existing + i })),
  });
  const note = samples.length ? ` (sample photo${samples.length > 1 ? 's' : ''} removed)` : '';
  ok(res, await getAdminProduct(req.params.id), `${saved.length} photo${saved.length > 1 ? 's' : ''} added${note}`);
}

export async function replaceProductImage(req, res) {
  if (!req.file) throw ApiError.badRequest('Choose an image');
  const image = await findProductImage(req);
  const saved = await saveImage(req.file, { folder: 'products', preset: 'product' });
  const { name } = await prisma.product.findUnique({ where: { id: req.params.id }, select: { name: true } });
  // A replaced photo is a real photo, so it loses any sample tag.
  await prisma.productImage.update({
    where: { id: image.id },
    data: { url: saved.url, publicId: saved.publicId, ...(isSample(image) && { alt: name }) },
  });
  await deleteImage(image.publicId);
  ok(res, await getAdminProduct(req.params.id), 'Photo replaced');
}

export async function updateProductImage(req, res) {
  const image = await findProductImage(req);
  await prisma.productImage.update({ where: { id: image.id }, data: { alt: req.body.alt } });
  ok(res, await getAdminProduct(req.params.id), 'Photo updated');
}

export async function reorderProductImages(req, res) {
  const { ids } = req.body;
  const current = await prisma.productImage.findMany({ where: { productId: req.params.id }, select: { id: true } });
  const same = current.length === ids.length && new Set(ids).size === ids.length && current.every((c) => ids.includes(c.id));
  if (!same) throw ApiError.badRequest('Send every photo of this product exactly once');
  await prisma.$transaction(ids.map((id, i) => prisma.productImage.update({ where: { id }, data: { sortOrder: i } })));
  ok(res, await getAdminProduct(req.params.id), 'Order saved');
}

export async function deleteProductImage(req, res) {
  const image = await findProductImage(req);
  await prisma.productImage.delete({ where: { id: image.id } });
  await deleteImage(image.publicId);
  await renumber(req.params.id);
  ok(res, await getAdminProduct(req.params.id), 'Photo deleted');
}

// ── Brands ───────────────────────────────────────────────────
const BRAND_ADMIN = { include: { categories: { select: { id: true, name: true } }, _count: { select: { products: true } } } };

const brandData = ({ slug, categoryIds, ...rest }) => ({
  ...rest,
  slug: slug || toSlug(rest.name),
  categories: { set: categoryIds.map((id) => ({ id })) },
});

export async function listBrands(req, res) {
  const brands = await prisma.brand.findMany({ ...BRAND_ADMIN, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  ok(res, brands);
}

export async function createBrand(req, res) {
  const { categories, ...data } = brandData(req.body);
  const brand = await prisma.brand.create({
    data: { ...data, categories: { connect: categories.set } },
    ...BRAND_ADMIN,
  });
  created(res, brand);
}

export async function updateBrand(req, res) {
  const brand = await prisma.brand.update({ where: { id: req.params.id }, data: brandData(req.body), ...BRAND_ADMIN });
  ok(res, brand);
}

export async function uploadBrandLogo(req, res) {
  if (!req.file) throw ApiError.badRequest('Choose a logo image');
  const existing = await prisma.brand.findUnique({ where: { id: req.params.id }, select: { logoPublicId: true } });
  if (!existing) throw ApiError.notFound('Brand not found');
  const saved = await saveImage(req.file, { folder: 'brands', preset: 'logo' });
  const brand = await prisma.brand.update({
    where: { id: req.params.id }, data: { logoUrl: saved.url, logoPublicId: saved.publicId }, ...BRAND_ADMIN,
  });
  await deleteImage(existing.logoPublicId);
  ok(res, brand, 'Logo uploaded');
}

export async function deleteBrandLogo(req, res) {
  const existing = await prisma.brand.findUnique({ where: { id: req.params.id }, select: { logoPublicId: true } });
  if (!existing) throw ApiError.notFound('Brand not found');
  const brand = await prisma.brand.update({ where: { id: req.params.id }, data: { logoUrl: null, logoPublicId: null }, ...BRAND_ADMIN });
  await deleteImage(existing.logoPublicId);
  ok(res, brand, 'Logo removed');
}

export async function deleteBrand(req, res) {
  // Products keep existing; their brand is cleared (onDelete: SetNull).
  const brand = await prisma.brand.delete({ where: { id: req.params.id } });
  await deleteImage(brand.logoPublicId);
  noContent(res);
}

// ── Gallery ──────────────────────────────────────────────────
const GALLERY_SELECT = { id: true, url: true, width: true, height: true, caption: true, category: true, sortOrder: true, createdAt: true };

export async function listGallery(req, res) {
  const { category } = req.validatedQuery;
  const images = await prisma.galleryImage.findMany({
    where: category ? { category } : {}, select: GALLERY_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  ok(res, images);
}

export async function addGalleryImages(req, res) {
  if (!req.files?.length) throw ApiError.badRequest('Choose at least one image');
  const saved = await saveAll(req.files, { folder: 'gallery', preset: 'gallery' });
  await prisma.galleryImage.createMany({
    data: saved.map((s) => ({
      url: s.url, publicId: s.publicId, width: s.width, height: s.height,
      category: req.body.category, caption: req.body.caption,
    })),
  });
  created(res, { count: saved.length }, `${saved.length} photo${saved.length > 1 ? 's' : ''} added`);
}

export async function updateGalleryImage(req, res) {
  const image = await prisma.galleryImage.update({ where: { id: req.params.id }, data: req.body, select: GALLERY_SELECT });
  ok(res, image);
}

export async function replaceGalleryImage(req, res) {
  if (!req.file) throw ApiError.badRequest('Choose an image');
  const existing = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Photo not found');
  const saved = await saveImage(req.file, { folder: 'gallery', preset: 'gallery' });
  const image = await prisma.galleryImage.update({
    where: { id: req.params.id },
    data: { url: saved.url, publicId: saved.publicId, width: saved.width, height: saved.height },
    select: GALLERY_SELECT,
  });
  await deleteImage(existing.publicId);
  ok(res, image, 'Photo replaced');
}

export async function reorderGallery(req, res) {
  const { ids } = req.body;
  if (new Set(ids).size !== ids.length) throw ApiError.badRequest('Duplicate ids');
  const found = await prisma.galleryImage.count({ where: { id: { in: ids } } });
  if (found !== ids.length) throw ApiError.badRequest('Unknown photo in order');
  await prisma.$transaction(ids.map((id, i) => prisma.galleryImage.update({ where: { id }, data: { sortOrder: i } })));
  ok(res, null, 'Order saved');
}

export async function deleteGalleryImage(req, res) {
  const image = await prisma.galleryImage.delete({ where: { id: req.params.id } });
  await deleteImage(image.publicId);
  noContent(res);
}

// ── Enquiries ────────────────────────────────────────────────
export async function listEnquiries(req, res) {
  const { status, type, ...rest } = req.validatedQuery;
  const pg = paginate(rest);
  const where = { ...(status && { status }), ...(type && { type }) };
  const [items, total] = await Promise.all([
    prisma.enquiry.findMany({
      where, orderBy: { createdAt: 'desc' }, take: pg.take, skip: pg.skip,
      include: { _count: { select: { items: true } } },
    }),
    prisma.enquiry.count({ where }),
  ]);
  ok(res, items, 'OK', pageMeta(pg, total));
}

export async function getEnquiry(req, res) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: { select: { slug: true, sku: true } } } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  ok(res, enquiry);
}

export async function updateEnquiry(req, res) {
  const enquiry = await prisma.enquiry.update({ where: { id: req.params.id }, data: req.body });
  ok(res, enquiry, 'Enquiry updated');
}

export async function deleteEnquiry(req, res) {
  await prisma.enquiry.delete({ where: { id: req.params.id } });
  noContent(res);
}
