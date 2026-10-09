import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import WhatsAppIcon from './WhatsAppIcon';
import { site, whatsappLink } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Products',
    links: [
      { href: '/categories/switches-and-sockets', label: 'Switches & Sockets' },
      { href: '/categories/lighting', label: 'Lighting' },
      { href: '/categories/wires-and-cables', label: 'Wires & Cables' },
      { href: '/categories/circuit-protection', label: 'Circuit Protection' },
      { href: '/categories/distribution-and-control', label: 'Distribution & Control' },
      { href: '/products', label: 'All products' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/brands', label: 'Our brands' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/contact', label: 'Contact' },
      { href: '/quote', label: 'Quote list' },
      { href: '/privacy', label: 'Privacy policy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Supplier of electrical products and installation materials for homes, shops, offices, buildings and contractors.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Get in touch</h2>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><a href={site.contact.phoneHref} className="hover:text-foreground">{site.contact.phone}</a></li>
            <li className="flex gap-2.5"><WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" /><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp {site.contact.phone}</a></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><a href={`mailto:${site.contact.email}`} className="break-all hover:text-foreground">{site.contact.email}</a></li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><a href={site.contact.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{site.contact.address}</a></li>
            <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><span>{site.contact.hours.map((h) => `${h.days}: ${h.time}`).join(' · ')}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Electrical products &amp; materials only. We don&apos;t sell home appliances, TVs or mobiles.</p>
        </div>
      </div>
    </footer>
  );
}
