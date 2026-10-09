import { site } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/admin', '/account', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/quote'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
