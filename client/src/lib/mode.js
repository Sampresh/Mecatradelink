// Showcase mode: no API configured (e.g. a client-only Vercel deploy). Public pages read the
// bundled catalogue snapshot (src/data/catalog.json), enquiries are sent via WhatsApp/email,
// and accounts/admin are hidden. Set NEXT_PUBLIC_API_URL to switch to the full site.
export const STATIC_MODE = !process.env.NEXT_PUBLIC_API_URL;
