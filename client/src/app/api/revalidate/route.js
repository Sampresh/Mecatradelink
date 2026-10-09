import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/serverApi';

// Called by the API after admin changes (products, photos, brands, gallery…) so the
// public pages show them immediately instead of after the cache window.
export async function POST(request) {
  const expected = process.env.INTERNAL_API_KEY;
  const given = request.headers.get('x-internal-key') ?? '';
  const ok = expected && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return Response.json({ revalidated: false }, { status: 401 });

  // expire: 0 → next request fetches fresh data (no stale content after an edit).
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
