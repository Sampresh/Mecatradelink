import 'server-only';
import catalog from '@/data/catalog.json';

// Mirrors the public API endpoints used by server components, backed by the bundled snapshot.
const byOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
const products = catalog.products.filter((p) => p.isActive !== false);

const toCard = (p) => ({
  id: p.id, name: p.name, slug: p.slug, model: p.model, summary: p.summary, unit: p.unit, isFeatured: p.isFeatured,
  category: p.category && { name: p.category.name, slug: p.category.slug },
  brand: p.brand && { id: p.brand.id, name: p.brand.name, slug: p.brand.slug, logoUrl: p.brand.logoUrl },
  imageUrl: p.imageUrl ?? p.images?.[0]?.url ?? null,
});

const matches = (p, q) => {
  const needle = q.toLowerCase();
  return [p.name, p.model, p.sku, p.summary, p.brand?.name, p.category?.name].some((v) => v?.toLowerCase().includes(needle));
};

function listProducts(params) {
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const limit = Math.min(Math.max(Number(params.get('limit')) || 12, 1), 100);
  const q = params.get('q')?.trim();
  const category = params.get('category');
  const brand = params.get('brand');
  const featured = params.get('featured');
  let rows = products.filter((p) =>
    (!q || matches(p, q))
    && (!category || p.category?.slug === category)
    && (!brand || p.brand?.slug === brand)
    && (featured == null || p.isFeatured === (featured === 'true')));
  rows = params.get('sort') === 'name'
    ? [...rows].sort((a, b) => a.name.localeCompare(b.name))
    : [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = rows.length;
  return {
    data: rows.slice((page - 1) * limit, page * limit).map(toCard),
    meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

const brandWithCount = (b) => ({ ...b, productCount: products.filter((p) => p.brand?.id === b.id).length });

/** Returns { data, meta } like serverFetch, or null for "not found". */
export function staticFetch(path) {
  const url = new URL(path, 'http://static.local');
  const parts = url.pathname.split('/').filter(Boolean);

  switch (parts[0]) {
    case 'categories':
      if (!parts[1]) return { data: [...catalog.categories].sort(byOrder) };
      return wrap(catalog.categories.find((c) => c.slug === parts[1]));
    case 'brands':
      if (!parts[1]) return { data: [...catalog.brands].sort(byOrder).map(brandWithCount) };
      return wrap(catalog.brands.map(brandWithCount).find((b) => b.slug === parts[1]));
    case 'products': {
      if (!parts[1]) return listProducts(url.searchParams);
      const product = products.find((p) => p.slug === parts[1]);
      if (!product) return null;
      const related = products
        .filter((p) => p.category?.slug === product.category?.slug && p.id !== product.id)
        .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
        .slice(0, 4)
        .map(toCard);
      return { data: { ...product, related } };
    }
    case 'gallery': {
      const category = url.searchParams.get('category');
      return { data: catalog.gallery.filter((g) => !category || g.category === category) };
    }
    case 'sitemap':
      return {
        data: {
          products: products.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt })),
          categories: catalog.categories.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt })),
          brands: catalog.brands.map((b) => ({ slug: b.slug, updatedAt: b.updatedAt })),
        },
      };
    default:
      return null;
  }
}

const wrap = (data) => (data ? { data } : null);
