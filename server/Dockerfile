# syntax=docker/dockerfile:1
# Meca Trade Link API — production image.
#   docker build -t mecatradelink-server ./server
# Targets: "build" (full deps + Prisma CLI, used for migrations/dev) and "runtime" (default).

ARG NODE_VERSION=24

# ── deps: full install (incl. Prisma CLI) ────────────────────
FROM node:${NODE_VERSION}-alpine AS build
# Prisma's query engine needs OpenSSL on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

# ── prod-deps: runtime dependencies only ─────────────────────
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# Optional deps must stay: sharp ships its native binaries as optional packages.
# The Prisma CLI (~170 MB) is a devDependency *and* an optional peer of @prisma/client, so
# the lockfile marks it (and its deps) "devOptional" and npm still installs it; remove exactly
# those packages afterwards.
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --omit=peer --ignore-scripts \
 && node -e "const fs=require('fs');for(const[k,v]of Object.entries(require('./package-lock.json').packages))if(k&&v.devOptional)fs.rmSync(k,{recursive:true,force:true})"
# Generated Prisma client + engine from the build stage.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# ── runtime ──────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
# npm/corepack aren't needed to run the app; removing them shrinks the image and attack surface.
RUN apk add --no-cache openssl tini \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
ENV NODE_ENV=production \
    PORT=5001
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json index.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node scripts ./scripts
# Local-disk upload fallback; mount a volume here (or use Cloudinary).
RUN mkdir -p uploads && chown node:node uploads

USER node
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# tini forwards SIGTERM so index.js shuts down gracefully.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
