// Business details shown across the site. Edit here; the server copy for emails is
// server/src/config/business.js.
const PHONE_DIGITS = '9779843888991'; // country code + number, no symbols

export const site = {
  name: 'Meca Trade Link',
  tagline: 'Electrical products & materials supplier',
  description:
    'Meca Trade Link, Madhyapur Thimi, supplies electrical switches, sockets, wires and cables, LED lighting, MCBs, distribution boards, accessories and tools for homes, shops, offices, buildings and electrical contractors.',
  // Explicit URL first; on Vercel fall back to the auto-provided production/deployment domain.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
    || 'http://localhost:3000'
  ).replace(/\/+$/, ''),
  contact: {
    phone: '+977 984-3888991',
    phoneHref: `tel:+${PHONE_DIGITS}`,
    whatsappNumber: PHONE_DIGITS,
    email: 'mecatradelink@gmail.com',
    address: 'Madhyapur Thimi, Bhaktapur, Nepal',
    shortAddress: 'Madhyapur Thimi',
    // TODO(launch): confirm opening hours.
    hoursShort: 'Sun–Fri, 9 AM – 7 PM',
    hoursCompact: '9 AM–7 PM',
    hours: [
      { days: 'Sunday – Friday', time: '9:00 AM – 7:00 PM' },
      { days: 'Saturday', time: 'Closed' },
    ],
    // TODO(launch): replace with the shop's exact Google Maps pin ("Share → Embed a map").
    mapEmbed: 'https://www.google.com/maps?q=Madhyapur%20Thimi%2C%20Bhaktapur%2C%20Nepal&output=embed',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Madhyapur%20Thimi%2C%20Bhaktapur%2C%20Nepal',
  },
};

/** WhatsApp click-to-chat link with an optional pre-filled message. */
export const whatsappLink = (text) =>
  `https://wa.me/${site.contact.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Pre-filled WhatsApp text asking for a product's price and availability. */
export const productMessage = (product) =>
  `Hello Meca Trade Link, I'd like the price and availability of: ${product.name}${product.model ? ` (${product.model})` : ''}.`;

export const nav = [
  { href: '/products', label: 'Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const GALLERY_CATEGORIES = [
  { value: 'SHOWROOM', label: 'Showroom' },
  { value: 'PRODUCTS', label: 'Products' },
  { value: 'STOCK', label: 'Stock' },
  { value: 'PROJECTS', label: 'Projects' },
  { value: 'INSTALLATIONS', label: 'Installations' },
  { value: 'COMPANY', label: 'Company' },
];
