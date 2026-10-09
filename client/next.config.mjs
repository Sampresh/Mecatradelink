const isDev = process.env.NODE_ENV !== 'production';
const origin = (url) => (url ? new URL(url).origin : null);
const apiOrigin = origin(process.env.NEXT_PUBLIC_API_URL);
const uploadsOrigin = origin(process.env.UPLOADS_PROXY_ORIGIN);

// next/image only loads from explicitly listed hosts — never '**'.
const remotePatterns = [{ protocol: 'https', hostname: 'res.cloudinary.com' }];
if (uploadsOrigin) {
  const { protocol, hostname, port } = new URL(uploadsOrigin);
  remotePatterns.push({ protocol: protocol.replace(':', ''), hostname, port, pathname: '/uploads/**' });
}

// Next 14's App Router injects inline bootstrap scripts, so script-src needs 'unsafe-inline'
// unless every page becomes dynamic for per-request nonces. The rest still blocks plugins,
// framing, <base> hijacking, foreign form targets and off-site fetches.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  ["img-src 'self' data: blob: https://res.cloudinary.com", uploadsOrigin].filter(Boolean).join(' '),
  "font-src 'self'",
  ["connect-src 'self'", apiOrigin, isDev && 'ws:'].filter(Boolean).join(' '),
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  !isDev && 'upgrade-insecure-requests',
].filter(Boolean).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the Docker image (ignored by Vercel).
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root; a stray lockfile in a parent folder otherwise confuses Turbopack.
  turbopack: { root: import.meta.dirname },
  // Dev only: don't reuse fetch results across requests, so admin edits show on reload
  // (production uses tag revalidation via /api/revalidate).
  experimental: { serverComponentsHmrCache: false },
  images: {
    remotePatterns,
    // Next 16 blocks optimising images from private IPs (SSRF guard). Only the dev
    // uploads fallback on localhost needs it; production images come from Cloudinary.
    dangerouslyAllowLocalIP: isDev,
    // Local Docker stack only: the optimiser runs inside the container, where the
    // browser-facing localhost:5001 upload URLs are unreachable, so serve them as-is.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
