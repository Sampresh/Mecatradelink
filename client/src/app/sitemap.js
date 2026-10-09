import { connection } from 'next/server';
import { serverFetch } from '@/lib/serverApi';
import { site } from '@/lib/site';

const STATIC = ['', '/products', '/brands', '/gallery', '/about', '/contact', '/privacy', '/terms'];

export default async function sitemap() {
  await connection(); // see app/page.js — never bake an empty sitemap at build time
  const res = await serverFetch('/sitemap', { revalidate: 3600, fallback: { products: [], categories: [], brands: [] } });
  const { products, categories, brands = [] } = res.data;

  return [
    ...STATIC.map((path) => ({ url: `${site.url}${path}`, changeFrequency: 'weekly', priority: path === '' ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${site.url}/categories/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'weekly', priority: 0.8 })),
    ...brands.map((b) => ({ url: `${site.url}/brands/${b.slug}`, lastModified: b.updatedAt, changeFrequency: 'monthly', priority: 0.6 })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
