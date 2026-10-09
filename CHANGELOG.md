# Changelog

## 0.5.0 — 2026-10-09

- Product grids are two columns on phones (compact cards: "Enquire" label, no summary); mobile catalogue page ~60% shorter.
- Sample product photos: illustrated placeholders for all 19 products (`server/scripts/sample-photos.js`, `--remove` to delete). Tagged as samples, shown with a "Sample" badge in admin, and removed automatically when real photos are uploaded.
- Fix: the admin product editor could load before its category/brand lists, showing "Select…" and clearing the brand on save. Forms now mount after the lists load (same guard for the brand editor). Regression test added.

## 0.4.1 — 2026-10-09 (QA pass)

- Seed only creates categories/sample products on an **empty** catalogue; it runs on every Docker deploy and previously re-added default categories (a stale image had re-created 5 old ones).
- API dev server: `index.js` imports the app statically so `node --watch` reloads on any change under `src/` (dynamic imports weren't watched).
- Docker dev override: API healthcheck (client waits on it) and unoptimised images in the containerised dev site.
- Login and register pages render on the server (no blank/spinner flash); `next` redirect is read server-side.
- Register / forgot-password have their own titles; paginated catalogue pages get their own title and canonical URL.
- `TRUST_PROXY` in docker-compose is overridable (`TRUST_PROXY=1 docker compose …`, used by the test suites).

## 0.4.0 — 2026-10-09

- **Product photos**: multiple photos per product with admin add / reorder / set cover / replace / delete; uploads normalised with sharp (1200×1200 WebP on white, EXIF stripped, 10 MB limit, magic-byte check). Product page photo gallery with thumbnails.
- **Brands**: Brand model with logo, description, website and categories; admin CRUD; home "Brands we deal with" strip, `/brands`, `/brands/[slug]`; products link to a brand. Existing free-text brands are migrated into Brand rows.
- **Products**: model/specification field; "Enquire Now" dialog (single-product quote request), WhatsApp enquiry with pre-filled message, call button; quote list kept for multi-item requests.
- **Categories** reorganised into: Switches & Sockets, Lighting, Wires & Cables, Circuit Protection, Electrical Accessories, Electrical Tools, Distribution & Control, Other Electrical Products.
- **Gallery**: six categories, admin batch upload/caption/reorder/replace/delete, public masonry grid with keyboard lightbox, home teaser.
- **About** rewritten (who we are, what we do, experience, values, commitment); **Why Choose Us** section.
- **Contact**: real phone/WhatsApp (+977 984-3888991), email (mecatradelink@gmail.com), Madhyapur Thimi address, Google Maps embed, business hours, floating WhatsApp button, contact strip under the hero. Enquiries accept phone *or* email.
- Admin edits revalidate the public site immediately (`/api/revalidate`, tag-based).
- Docker: server runtime keeps sharp's optional native binaries and strips only `devOptional` packages.

## 0.3.0 — 2026-10-09

- Production Docker images for API and website (multi-stage, Node 24 Alpine, non-root, health checks, tini for graceful shutdown in the API, npm removed from runtime layers). Server runtime image excludes the Prisma CLI (537 MB → 412 MB).
- `docker-compose.yml` is now a production-like stack (postgres → one-off migrate/seed → server → client) with an uploads volume; `docker-compose.override.yml` provides hot-reload dev mode.
- Next.js `output: 'standalone'`; home page and sitemap render per request so images never ship build-time-empty content.
- Node 20 (EOL April 2026) → Node 24 LTS for `.node-version`, images and CI.

## 0.2.0 — 2026-10-09

- Upgraded Next.js 14.2.35 → 16.4.0 (pinned) and React 18 → 19.3; clears all `npm audit` findings for the client (was 1 critical, 1 high).
- Route `params`/`searchParams` are now awaited in server pages; client pages use `useParams()`.
- ESLint 8 → 9 with flat config (`next lint` was removed in Next 16); fixed two effects flagged by the new react-hooks rules (mobile menu close on navigation, admin enquiry follow-up form).
- `next/image`: local-IP upstreams allowed in development only (Next 16 blocks them by default).
- Turbopack is now the default bundler for dev and build.

## 0.1.1 — 2026-10-09 (security review)

- XSS: escape `<` in JSON-LD (a product name could close the `<script>` tag); reject markup in user names; https-only category image URLs; CSP + nosniff/X-Frame-Options/Referrer-Policy/Permissions-Policy/HSTS on the site.
- CSRF: refresh/logout (the only cookie-auth endpoints) now reject foreign `Origin` / `Sec-Fetch-Site: cross-site`; refresh cookie is `SameSite=Strict`.
- Auth: atomic single use for refresh and email tokens (parallel reset requests all succeeded before); atomic failed-login counter (parallel guesses bypassed lockout); password change/reset invalidates outstanding access tokens; register/forgot-password no longer leak account existence via timing; login `next` redirect rejects `/\host`.
- Rate limiting: `TRUST_PROXY` configurable (was hard-coded, so X-Forwarded-For could be spoofed when not behind a proxy); `INTERNAL_API_KEY` lets SSR traffic from shared Vercel IPs skip the global per-IP limit.

## 0.1.0 — 2026-10-09

- Initial scaffold: Next.js client + Express/Prisma API.
- Catalogue (categories, products, search), quote list + quote/contact enquiries with email notifications.
- Accounts with email verification, refresh-token rotation and progressive login lockout.
- Admin: dashboard, enquiries, products (with image upload), categories.
- Landing page built on the Aether Flow particle hero, re-themed for electrical supplies.
