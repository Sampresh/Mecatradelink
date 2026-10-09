// Snapshots the live catalogue into the client so the site can run with no API/database
// ("showcase mode", e.g. a client-only Vercel deploy).
//
//   cd client && npm run export-data                     # from http://localhost:5001/api/v1
//   npm run export-data -- --api https://api.example.com/api/v1
//
// Writes src/data/catalog.json and copies every photo/logo into public/images/catalog/.
// Commit both, then deploy. Re-run whenever products, photos, brands or the gallery change.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const API = (arg('--api') ?? process.env.EXPORT_API_URL ?? 'http://localhost:5001/api/v1').replace(/\/+$/, '');
const IMG_DIR = path.join(ROOT, 'public/images/catalog');
const DATA_FILE = path.join(ROOT, 'src/data/catalog.json');

async function get(p) {
  const res = await fetch(API + p);
  if (!res.ok) throw new Error(`GET ${p} → ${res.status}`);
  return (await res.json()).data;
}

// Download each referenced image once and return its new public path.
const copied = new Map();
async function localise(url, folder) {
  if (!url) return url;
  if (!/\/uploads\//.test(url) && !url.includes('res.cloudinary.com')) return url; // already public/static
  if (copied.has(url)) return copied.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image ${url} → ${res.status}`);
  const ext = path.extname(new URL(url).pathname) || '.webp';
  const name = `${path.basename(new URL(url).pathname, ext)}${ext}`;
  await fs.mkdir(path.join(IMG_DIR, folder), { recursive: true });
  await fs.writeFile(path.join(IMG_DIR, folder, name), Buffer.from(await res.arrayBuffer()));
  const local = `/images/catalog/${folder}/${name}`;
  copied.set(url, local);
  return local;
}

console.log(`Exporting catalogue from ${API}`);
await fs.rm(IMG_DIR, { recursive: true, force: true });

const categories = await get('/categories');
const categoryDetails = await Promise.all(categories.map((c) => get(`/categories/${c.slug}`)));

const brands = await get('/brands');
for (const b of brands) b.logoUrl = await localise(b.logoUrl, 'brands');
for (const c of categoryDetails) for (const b of c.brands) b.logoUrl = await localise(b.logoUrl, 'brands');

const slugs = [];
for (let page = 1; ; page++) {
  const res = await fetch(`${API}/products?limit=100&page=${page}`).then((r) => r.json());
  slugs.push(...res.data.map((p) => p.slug));
  if (page >= res.meta.totalPages) break;
}
const products = [];
for (const slug of slugs) {
  const { related, ...p } = await get(`/products/${slug}`);
  for (const img of p.images) img.url = await localise(img.url, 'products');
  if (p.brand) p.brand.logoUrl = await localise(p.brand.logoUrl, 'brands');
  p.imageUrl = p.images[0]?.url ?? null;
  products.push(p);
}

const gallery = await get('/gallery');
for (const g of gallery) g.url = await localise(g.url, 'gallery');

const snapshot = {
  exportedAt: new Date().toISOString(),
  source: API,
  categories: categoryDetails.map((c) => ({ ...c, productCount: categories.find((x) => x.id === c.id)?.productCount ?? 0 })),
  brands,
  products,
  gallery,
};
await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
await fs.writeFile(DATA_FILE, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`✔ ${categories.length} categories, ${products.length} products, ${brands.length} brands, ${gallery.length} gallery photos`);
console.log(`✔ ${copied.size} images → public/images/catalog/`);
console.log(`✔ data → src/data/catalog.json`);
