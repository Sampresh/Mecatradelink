import { site } from './site';

// JSON for <script type="application/ld+json">. Escaping "<" stops a value such as
// "</script><script>…" from closing the tag (JSON.stringify alone does not).
export const jsonLdHtml = (data) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'),
});

export function buildMetadata({ title, description = site.description, path = '/', image, noIndex } = {}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ? `${title} | ${site.name}` : site.name,
      description,
      url: path,
      siteName: site.name,
      type: 'website',
      ...(image && { images: [{ url: image }] }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}/images/brand/logo-512.png`,
  image: `${site.url}/opengraph-image.png`,
  email: site.contact.email,
  telephone: site.contact.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Madhyapur Thimi',
    addressRegion: 'Bhaktapur',
    addressCountry: 'NP',
  },
  areaServed: 'Kathmandu Valley',
});
