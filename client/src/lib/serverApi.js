import 'server-only';
import { STATIC_MODE } from './mode';
import { staticFetch } from './staticApi';

// Every catalogue fetch carries this tag; /api/revalidate expires it after admin edits.
export const CATALOG_TAG = 'catalog';

const ORIGIN = (process.env.INTERNAL_API_ORIGIN || 'http://localhost:5001').replace(/\/+$/, '');

/**
 * Fetch from the API inside server components. Returns { data, meta } or null on 404.
 * Other failures throw, unless `fallback` is given (used by list sections so builds
 * succeed while the API is unreachable).
 */
export async function serverFetch(path, { revalidate = 60, fallback } = {}) {
  // Showcase mode: no API, answer from the bundled catalogue snapshot.
  if (STATIC_MODE) return staticFetch(path);
  try {
    const res = await fetch(`${ORIGIN}/api/v1${path}`, {
      next: { revalidate, tags: [CATALOG_TAG] },
      // Lets the API tell SSR traffic (a few shared Vercel IPs) apart from visitors for rate limiting.
      headers: process.env.INTERNAL_API_KEY ? { 'x-internal-key': process.env.INTERNAL_API_KEY } : {},
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
    const body = await res.json();
    return { data: body.data, meta: body.meta };
  } catch (err) {
    if (fallback !== undefined) return { data: fallback, meta: undefined };
    throw err;
  }
}
