import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// After a successful admin change, ask the website to drop its cached catalogue so
// edits (photos, prices-on-request text, brands, gallery…) show up immediately.
// Bursts (e.g. several photo operations) are collapsed into one call.
let timer = null;

function triggerRevalidate() {
  if (!env.REVALIDATE_URL || !env.INTERNAL_API_KEY) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetch(`${env.REVALIDATE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-internal-key': env.INTERNAL_API_KEY },
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => { if (!r.ok) logger.warn(`Site revalidation returned ${r.status}`); })
      .catch((err) => logger.warn(`Site revalidation failed: ${err.message}`));
  }, 300);
}

export function revalidateSiteOnChange(req, res, next) {
  if (req.method !== 'GET') {
    res.on('finish', () => { if (res.statusCode < 400) triggerRevalidate(); });
  }
  next();
}
