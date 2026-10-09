# Deployment

Production layout: **client** on Vercel at `https://<domain>`, **API** on Render at `https://api.<domain>`, **Postgres** on Neon. Replace `<domain>` (placeholder used so far: `mecatradelink.com`).

## 1. Neon (database)
1. Create a project with two branches: `production` and `development`.
2. For each branch copy both connection strings:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
   - **Direct** → `DIRECT_URL`
3. Never point a local `prisma migrate dev` at the production branch.

## 2. Render (API)
Create a **Web Service** (native Node runtime, not Docker):

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Build command | `npm ci && npx prisma generate` |
| Start command | `node index.js` |
| Health check path | `/health` |
| Instance | paid (no cold starts), region closest to the Neon DB |

Environment variables (all from `.env.example`, server section):
- `NODE_ENV=production`, `FORCE_HTTPS=true`
- `TRUST_PROXY=1`: Render puts one proxy in front of the service. After the first deploy, check that the real client IP shows up in rate-limit behaviour or logs. If every visitor is seen as the same IP, increase it. Never set it higher than the real number of hops, or clients can spoof `X-Forwarded-For` and dodge rate limits.
- `INTERNAL_API_KEY`: `openssl rand -hex 32`. Use the **same value on Vercel**. It lets server-rendered catalogue requests bypass the per-IP global limit, and authorises the API's call to the site's `/api/revalidate`.
- `REVALIDATE_URL=https://<domain>`: the website the API notifies after admin edits, so changes show immediately. Defaults to `CLIENT_URL`.
- `DATABASE_URL`, `DIRECT_URL` (Neon production branch)
- `CLIENT_URL=https://<domain>` (exact origin, apex, no trailing slash)
- `SERVER_PUBLIC_URL=https://api.<domain>`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: two **different** values from `openssl rand -hex 32`
- `SMTP_*`, `FROM_EMAIL`, `FROM_NAME`, `ENQUIRY_NOTIFY_EMAIL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ chars, not a placeholder; the seed refuses weak values)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. These are **required in production**, because Render's disk is ephemeral.

First deploy, then in the Render **Shell**:
```bash
npx prisma migrate deploy
node prisma/seed.js             # creates the admin
node prisma/seed.js --catalog   # optional: also seed starter categories/products
```
Run `npx prisma migrate deploy` again after every deploy that adds a migration.

## 3. Vercel (client)
| Setting | Value |
| --- | --- |
| Root directory | `client` |
| Framework | Next.js |

Client variables only:
- `NEXT_PUBLIC_API_URL=https://api.<domain>/api/v1`
- `NEXT_PUBLIC_SITE_URL=https://<domain>`
- `INTERNAL_API_ORIGIN=https://api.<domain>`
- `UPLOADS_PROXY_ORIGIN`: leave unset in production (images come from Cloudinary)
- `INTERNAL_API_KEY`: same value as on Render. **Never** prefix it with `NEXT_PUBLIC_`.

## 4. DNS
| Record | Name | Target |
| --- | --- | --- |
| A | `@` | Vercel IP (76.76.21.21) |
| CNAME | `www` | `cname.vercel-dns.com`, set in Vercel as a **308 redirect to the apex** |
| CNAME | `api` | `<service>.onrender.com` (add the custom domain in Render) |

## 5. Email
For Gmail, use an **App Password** (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`). For better deliverability use a transactional provider and set SPF/DKIM for `<domain>`.

## 6. Launch checklist
- [ ] Real phone, address and email in `client/src/lib/site.js`
- [ ] Privacy and terms pages reviewed
- [ ] Admin password changed after first login
- [ ] Product photos uploaded (Cloudinary)
- [ ] `https://<domain>/sitemap.xml` submitted to Google Search Console

## Alternative: deploy with Docker
The default plan above uses Render's native Node runtime and Vercel. To self-host instead (VPS, Fly.io, ECS, Render Docker services, etc.), use the images described in the README:
- **API image**: set the same env vars as the Render section. Run migrations once per release with the `build` target: `docker run --rm --env-file .env <server-image-built-with --target build> npx prisma migrate deploy`. Mount a volume at `/app/uploads`, or configure Cloudinary (recommended).
- **Client image**: build with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` as build args for that environment. At runtime set `INTERNAL_API_ORIGIN` (internal URL of the API) and `INTERNAL_API_KEY`. Don't set `NEXT_IMAGE_UNOPTIMIZED`; it's only for the local Compose stack.
- Put both behind a TLS-terminating proxy and set `TRUST_PROXY` to the number of proxy hops.

Payments are intentionally **not** part of this project, so no webhooks need registering.
