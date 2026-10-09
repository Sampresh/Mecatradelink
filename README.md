# Meca Trade Link

Website for **Meca Trade Link**, a supplier of electrical products and installation materials: switches and sockets, wires and cables, LED lighting, MCBs and distribution boards, accessories and tools. Customers browse the catalogue, build a quote list and send it to the sales team. Nothing is paid for online.

| Part | Stack | Host |
| --- | --- | --- |
| `client/` | Next.js 16 App Router (JS, React 19), Tailwind, TanStack Query, Zustand, react-hook-form + zod, framer-motion | Vercel |
| `server/` | Express 5 (ESM), Prisma, PostgreSQL, JWT, Zod, Nodemailer, Cloudinary | Render |
| DB | PostgreSQL 16 | Neon |

## Quick start (local)

```bash
cp .env.example .env              # then set JWT secrets + ADMIN_PASSWORD; leave SMTP_HOST blank in dev
cp .env.example client/.env.local # only the NEXT_PUBLIC_* / INTERNAL_* / UPLOADS_* lines are used

docker compose up -d postgres     # Postgres on :5432

cd server
npm install
npm run db:migrate                # applies migrations
npm run db:seed                   # admin user + 8 categories + sample products
npm run dev                       # API on http://localhost:5001

cd ../client
npm install
npm run dev                       # site on http://localhost:3000
```

## Docker

Two images, both multi-stage on Node 24 Alpine, running as the non-root `node` user with health checks:

| Image | Size | Contents |
| --- | --- | --- |
| `mecatradelink-server` | ~410 MB | API, runtime deps only + generated Prisma client (no Prisma CLI, no npm) |
| `mecatradelink-client` | ~300 MB | Next.js standalone server (no npm) |

**Production-like stack** (built images, `NODE_ENV=production`):
```bash
docker compose -f docker-compose.yml up -d --build   # postgres → migrate (+seed) → server → client
docker compose -f docker-compose.yml logs -f server
docker compose -f docker-compose.yml down            # add -v to also wipe DB + uploads volumes
```
The `migrate` service runs `prisma migrate deploy` and the seed once, then exits; the API waits for it.
It needs `INTERNAL_API_KEY`, `JWT_*` and `ADMIN_*` set in the root `.env`.

**Dev mode with hot reload**: plain `docker compose up --build` also applies `docker-compose.override.yml`, which mounts the source folders and runs `npm run dev` in both containers.

**Building images for a registry:**
```bash
docker build -t mecatradelink-server ./server
docker build -t mecatradelink-client \
  --build-arg NEXT_PUBLIC_API_URL=https://api.<domain>/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://<domain> ./client
```
`NEXT_PUBLIC_*` values (and the CSP/image hosts derived from them) are **baked in at build time**, so build one client image per environment. Runtime env for the client: `INTERNAL_API_ORIGIN`, `INTERNAL_API_KEY`.

> Docker builds need several GB of free disk. Reclaim build cache with `docker builder prune`.

In dev, emails (verification, password reset, enquiry alerts) are **logged to the API console** instead of being sent. Uploads are stored in `server/uploads/` unless Cloudinary is configured.

## Features

**Managing content (Admin → `/admin`):**
- **Products**: add, edit, hide or delete. Set category, brand, model/spec, summary, specs and "featured" flag.
- **Product photos**: up to 10 per product. Drag-and-drop upload, reorder, make cover, replace, delete. Every photo is automatically converted to a **1200×1200 WebP on a white background** (EXIF/GPS stripped), so the catalogue looks uniform whatever the source photo.
- **Brands**: name, logo (transparent PNG works best), description, website and the categories they cover. Shown on the home page, `/brands` and `/brands/<slug>`.
- **Gallery**: Showroom, Products, Stock, Projects, Installations and Company photos. Batch upload, caption, re-categorise, reorder, replace, delete.
- **Categories** and **Enquiries** (status, internal notes, reply by WhatsApp or email).
- Changes appear on the public site **immediately**: the API calls the site's `/api/revalidate` endpoint after every admin edit.

**Sample product photos (placeholders):** every product currently has an illustrated placeholder photo, marked "Sample" in admin. Upload real photos to a product and its samples are removed automatically (or use **Replace** on the sample).
```bash
cd server
node scripts/sample-photos.js            # add samples to products that have no photos (never touches real photos)
node scripts/sample-photos.js --remove   # delete every sample photo
node scripts/sample-photos.js --api https://api.<domain>/api/v1   # run against production
```

- **Landing page** with the animated particle-network hero (`client/src/components/ui/aether-flow-hero.jsx`), categories, featured products, audiences, an "electrical supplier, not an appliance store" section, and calls to action.
- **Catalogue**: `/products`, `/categories/[slug]` and `/products/[slug]`. These are server-rendered for SEO, with search and pagination.
- **Quote list**: customers add products and quantities, then submit from `/quote`. No account is needed. The sales inbox receives an email and the customer gets an acknowledgement.
- **Contact form** at `/contact`.
- **Accounts**: register, email verification, login, forgot/reset password, profile, and the customer's own quote history (`/account`).
- **Admin** (`/admin`): dashboard, enquiry inbox with status and internal notes, product CRUD with image upload and specs, category CRUD.

## Useful commands

| Where | Command | What |
| --- | --- | --- |
| server | `npm run dev` | API with file watching |
| server | `npm run check` | `node --check` every server file |
| server | `npm run db:migrate -- --name <change>` | create + apply a migration |
| server | `npm run db:studio` | Prisma Studio |
| server | `node scripts/create-admin.js you@x.com` | promote an existing user to admin |
| client | `npm run build` | production build |
| client | `npm run lint` | ESLint 9 (flat config, `eslint.config.mjs`) |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.
