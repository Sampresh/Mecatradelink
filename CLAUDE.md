# Meca Trade Link: notes for Claude

Electrical products supplier website (switches, cables, LED lighting, MCBs, DBs, accessories, tools). **Not** an appliance/electronics store; keep copy consistent with that. No online payments; the conversion goal is a quote request.

## Run
- DB: `docker compose up -d postgres` (:5432, user/pass/db `meca`/`meca`/`mecatradelink`)
- API: `cd server && npm run dev` → http://localhost:5001 (health: `/health`, API: `/api/v1`)
- Client: `cd client && npm run dev` → http://localhost:3000
- Env: single repo-root `.env` (server reads it via `src/config/env.js`; Prisma CLI via `dotenv -e ../.env` in npm scripts). Client uses `client/.env.local`.

## Docker
- Images: `server/Dockerfile` (targets `build` = full deps/Prisma CLI for migrations, `runtime` = default) and `client/Dockerfile` (Next `output: 'standalone'`).
- `docker compose -f docker-compose.yml up -d --build` = production-like stack. Plain `docker compose up` adds the hot-reload override.
- Runtime server image installs with `--omit=dev --omit=peer`, then deletes lockfile packages marked `devOptional` (the Prisma CLI tree). Optional deps must stay: sharp's native binaries are optional packages.
- Home page and sitemap call `connection()` so they render per request; otherwise `next build` (no API reachable) would bake empty pages into the image.
- If an image contains 0-byte files after a disk-full incident, rebuild with `--no-cache`.
- Always `up --build` after code changes: the `migrate` job uses the separate `mecatradelink-server:build` image, which goes stale otherwise.
- The seed runs on every deploy, so it must stay idempotent and never touch an existing catalogue (it only seeds when there are 0 categories).
- `server/index.js` must import `./src/app.js` statically (dynamic imports aren't tracked by `node --watch`).

## Verify after changes
- Server: `cd server && npm run check`
- Client: `cd client && npm run lint && npm run build`

## Architecture rules
- Server layering: route → middleware → validator (zod, `src/validators`) → controller → service/Prisma. Routes hold no logic.
- `validate({ query })` stores parsed query on `req.validatedQuery` (Express 5 `req.query` is read-only).
- Admin routes: `router.use(verifyToken, requireAdmin)`. User-owned `/:id` routes use `requireOwnership`.
- Client components call `src/services/index.js`, never axios directly. Server data → TanStack Query. Zustand holds **only** auth state. The quote list is a localStorage-backed `useSyncExternalStore` hook (`src/hooks/useQuoteList.js`).
- Next.js 16 / React 19: in server pages `params`/`searchParams` are Promises (`const params = await props.params`); client pages use `useParams()`/`useSearchParams()`. Don't set state from effects (react-hooks lint rule); derive it or remount with `key`.
- Public SEO pages are server components using `src/lib/serverApi.js`; missing records → `notFound()`.
- Colours are CSS variables in `src/styles/globals.css`, mirrored in `tailwind.config.js`. Use tokens (`bg-surface`, `text-primary`), not raw hex.
- shadcn-style primitives live in `client/src/components/ui` (JS, `components.json` has `tsx: false`).
- Security invariants (covered by the security test harness, see CHANGELOG 0.1.1):
  - Never render API data with `JSON.stringify` inside `<script>`; use `jsonLdHtml()` from `src/lib/seo.js`.
  - Only `/auth/refresh` and `/auth/logout` read the cookie; they sit behind `requireSameOrigin`. Every other route authenticates with a Bearer token.
  - Single-use tokens are claimed with `updateMany(... where usedAt/revokedAt: null)` and checked by `count`, never read-then-write.
  - Access tokens carry `pv` (password version); changing or resetting the password sets `passwordChangedAt`.
  - Product HTML is sanitised on write (`sanitizeRichText`); name fields reject `<` and `>`.
- Category slugs are generated with slugify (`&` → `and`, e.g. `wires-and-cables`).
- Images: every upload goes through `server/src/services/upload.service.js` (sharp presets: `product` = 1200² white square, `logo` = ≤600×300 with alpha, `gallery` = ≤2000px, all WebP). Product photos live in `ProductImage` (sortOrder 0 = cover); API cards expose the cover as `imageUrl`.
- Cache: server components fetch through `serverFetch` (tag `catalog`). Admin mutations trigger `revalidateSiteOnChange` → POST `<REVALIDATE_URL>/api/revalidate` (x-internal-key) → `revalidateTag('catalog', { expire: 0 })`. Keep new admin write routes under `admin.routes.js` so they inherit this.
- Never import client-module exports (`'use client'` files) into server components for plain helpers; shared helpers go in `src/lib/*` (e.g. `productMessage` in `lib/site.js`).
- Sample photos: `server/scripts/sample-photos.js` uploads SVG illustrations via `POST /admin/products/:id/images?sample=true`; they're tagged by an alt suffix (`server/src/lib/sampleImages.js`). Uploading real photos to a product deletes its samples, and Replace clears the tag.
- Admin forms with `<select>`/checkboxes fed by queries must mount only after those queries load (see `ProductForm`), otherwise saved values are dropped.
- Brand assets: `docs/brand/logo-master.png` (transparent) is the source; regenerate `client/public/images/brand/logo-{96,192,512}.png`, `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.png` from it. Use `<BrandMark>` for the badge and `<Logo>` for badge + name.
- Buttons are mobile-first; avoid hard-coding large heights on phones.
- Business details (phone, WhatsApp, email, address, hours, map) live in `client/src/lib/site.js` and `server/src/config/business.js`.
- Business contact details are placeholders in `client/src/lib/site.js`.
