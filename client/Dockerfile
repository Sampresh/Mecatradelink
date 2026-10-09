# syntax=docker/dockerfile:1
# Meca Trade Link website — production image (Next.js standalone).
#   docker build -t mecatradelink-client \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://example.com ./client
# NEXT_PUBLIC_* and image/CSP settings are baked in at build time.
# INTERNAL_API_ORIGIN and INTERNAL_API_KEY are read at runtime.

ARG NODE_VERSION=24

# ── deps ─────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ── build ────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG UPLOADS_PROXY_ORIGIN=""
ARG NEXT_IMAGE_UNOPTIMIZED=false
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    UPLOADS_PROXY_ORIGIN=${UPLOADS_PROXY_ORIGIN} \
    NEXT_IMAGE_UNOPTIMIZED=${NEXT_IMAGE_UNOPTIMIZED} \
    NEXT_TELEMETRY_DISABLED=1
RUN test -n "$NEXT_PUBLIC_API_URL" && test -n "$NEXT_PUBLIC_SITE_URL" \
  || (echo "NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL build args are required" && exit 1)
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── runtime ──────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
# npm/corepack aren't needed to run the app; removing them shrinks the image and attack surface.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
