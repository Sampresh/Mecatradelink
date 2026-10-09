import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Boxes, Briefcase, Building2, Check, Clock, Factory, HardHat, Headset, Home, MapPin,
  Phone, ShieldCheck, Store, Tags, Timer, Truck, X, Zap,
} from 'lucide-react';
import CategoryCard from '@/components/catalog/CategoryCard';
import { ProductGrid } from '@/components/catalog/ProductCard';
import BrandLogo from '@/components/catalog/BrandLogo';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { ButtonLink, buttonClasses } from '@/components/ui/button';
import { site, whatsappLink, GALLERY_CATEGORIES } from '@/lib/site';
import { reveal } from '@/lib/motion';

// On phones the action is a compact "View all →" link beside the eyebrow; from sm up it's an outline button.
function SectionHeading({ eyebrow, title, description, action, id }) {
  return (
    <div {...reveal('soft')} className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="mb-1.5 flex items-center justify-between gap-4 sm:mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:text-sm">{eyebrow}</p>
          {action && (
            <Link href={action.href} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-primary sm:hidden">
              {action.short ?? 'View all'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </div>
        <h2 id={id} className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{description}</p>}
      </div>
      {action && (
        <ButtonLink href={action.href} variant="outline" className="hidden sm:inline-flex">
          {action.label} <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      )}
    </div>
  );
}

/** Quick contact bar directly under the hero: one row of tap targets on phones, details on larger screens. */
export function ContactStrip() {
  const wa = whatsappLink('Hello Meca Trade Link, I have an enquiry.');
  const items = [
    { icon: Phone, label: 'Call us', short: 'Call', value: site.contact.phone, href: site.contact.phoneHref },
    { icon: WhatsAppIcon, label: 'WhatsApp', short: 'WhatsApp', value: site.contact.phone, href: wa, external: true },
    { icon: MapPin, label: 'Visit us', short: 'Directions', value: site.contact.shortAddress, href: site.contact.mapLink, external: true },
    { icon: Clock, label: 'Open', short: site.contact.hoursCompact, value: site.contact.hoursShort, href: '/contact' },
  ];
  const linkProps = (item) => ({ href: item.href, ...(item.external && { target: '_blank', rel: 'noopener noreferrer' }) });

  return (
    <section aria-label="Contact details" className="border-y border-border bg-surface/50">
      {/* Phones: 4 compact actions in one row */}
      <ul className="container-page grid grid-cols-4 gap-1 py-3 sm:hidden">
        {items.map((item) => (
          <li key={item.label} {...reveal('fade')}>
            <a
              {...linkProps(item)}
              aria-label={`${item.label}: ${item.value}`}
              className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center transition-colors active:bg-surface-2"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-full ${item.short === 'WhatsApp' ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-primary/10 text-primary'}`}>
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[11px] font-medium leading-tight text-zinc-300">{item.short}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: icon + label + value */}
      <div className="container-page hidden grid-cols-2 gap-x-6 gap-y-4 py-6 sm:grid lg:grid-cols-4">
        {items.map((item) => (
          <a key={item.label} {...reveal('fade')} {...linkProps(item)} className="group flex items-center gap-3 rounded-lg transition-colors hover:text-primary">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110"><item.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-muted">{item.label}</span>
              <span className="block truncate text-sm font-semibold text-zinc-100">{item.value}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function CategoriesSection({ categories }) {
  if (!categories.length) return null;
  return (
    <section className="border-y border-border bg-surface/30 py-12 sm:py-20 lg:py-24" aria-labelledby="categories-heading">
      <div className="container-page">
      <SectionHeading
        id="categories-heading"
        eyebrow="Shop by category"
        title="Everything for an electrical installation"
        description="Browse our range by category. Can't see what you need? We stock far more than is listed online."
        action={{ href: '/products', label: 'All products' }}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>
      </div>
    </section>
  );
}

export function FeaturedSection({ products }) {
  if (!products.length) return null;
  return (
    <section className="py-12 sm:py-20 lg:py-24" aria-labelledby="featured-heading">
      <div className="container-page">
        <SectionHeading
          id="featured-heading"
          eyebrow="High-demand products"
          title="Popular with our customers"
          description="Tap Enquire for today's price and availability. No online payment, just a quick reply from our team."
          action={{ href: '/products', label: 'Browse catalogue' }}
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

const WHY = [
  { icon: ShieldCheck, title: 'Quality electrical products', text: 'Rated, certified products that are safe to install and built to last.' },
  { icon: BadgeCheck, title: 'Genuine products', text: 'Sourced from manufacturers and authorised distributors. Never copies.' },
  { icon: Boxes, title: 'Wide range of products', text: 'Switches to switchgear: one supplier for the whole installation.' },
  { icon: Tags, title: 'Competitive pricing', text: 'Fair quotes based on quantity, with better rates for bulk orders.' },
  { icon: Truck, title: 'Reliable supply', text: 'Fast-moving items in stock, special items sourced on request.' },
  { icon: HardHat, title: 'Support for contractors & businesses', text: 'Repeat-order support, project quotes and technical guidance.' },
  { icon: Timer, title: 'Fast, reliable service', text: 'Quick replies by phone, WhatsApp or email, and prompt dispatch.' },
];

export function WhyChooseUs() {
  return (
    <section className="container-page py-12 sm:py-20 lg:py-24" aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        eyebrow="Why choose us"
        title="The supplier electricians come back to"
        description={`Customers across ${site.contact.shortAddress} and the Kathmandu Valley rely on us for the right product at the right price.`}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {WHY.map(({ icon: Icon, title, text }) => (
          <div key={title} {...reveal()} className="card-glow card-glow-fill group rounded-lg border border-border bg-surface p-4 sm:p-6">
            <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-6 sm:mb-4 sm:h-11 sm:w-11"><Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" aria-hidden /></span>
            <h3 className="text-sm font-semibold leading-snug sm:text-base">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-1.5 sm:text-sm">{text}</p>
          </div>
        ))}
        <a
          href={whatsappLink('Hello Meca Trade Link, I would like a quotation.')}
          target="_blank"
          rel="noopener noreferrer"
          {...reveal()}
          className="card-glow card-glow-fill group flex flex-col justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 sm:p-6"
        >
          <Zap className="h-7 w-7 text-primary" aria-hidden />
          <span>
            <span className="block font-semibold">Need a price today?</span>
            <span className="mt-1 flex items-center gap-1.5 text-sm text-primary">Message us on WhatsApp <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </span>
        </a>
      </div>
    </section>
  );
}

export function BrandsSection({ brands }) {
  if (!brands.length) return null;
  return (
    <section className="border-y border-border bg-surface/30 py-12 sm:py-20 lg:py-24" aria-labelledby="brands-heading">
      <div className="container-page">
        <SectionHeading
          id="brands-heading"
          eyebrow="Brands we deal with"
          title="Trusted brands, genuine stock"
          action={{ href: '/brands', label: 'All brands' }}
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.slice(0, 12).map((b) => (
            <li key={b.id} {...reveal('zoom')}>
              <Link href={`/brands/${b.slug}`} className="block rounded-lg ring-primary/0 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/60" title={b.name}>
                <BrandLogo brand={b} size="lg" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const AUDIENCES = [
  { icon: Home, title: 'Homes', text: 'Wiring, switches and lighting for new homes and renovations.' },
  { icon: Store, title: 'Shops', text: 'Bright, efficient LED lighting and safe power points for retail.' },
  { icon: Briefcase, title: 'Offices', text: 'Panel lights, modular switches and distribution for workspaces.' },
  { icon: Building2, title: 'Buildings', text: 'Distribution boards, MCBs and cabling for multi-storey projects.' },
  { icon: HardHat, title: 'Contractors', text: 'Reliable bulk supply and repeat orders for electricians.' },
  { icon: Factory, title: 'Projects', text: 'Itemised quotes for site BOQs, delivered in phases.' },
];

export function AudienceSection() {
  return (
    <section className="container-page py-12 sm:py-20 lg:py-24" aria-labelledby="audience-heading">
      <SectionHeading id="audience-heading" eyebrow="Who we supply" title="Built for the people who build" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-3">
        {AUDIENCES.map(({ icon: Icon, title, text }) => (
          <div key={title} {...reveal('fade')} className="group bg-background p-4 transition-colors duration-300 hover:bg-surface sm:p-7">
            <Icon className="mb-3 h-6 w-6 text-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:scale-110 sm:mb-4 sm:h-7 sm:w-7" aria-hidden />
            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-1.5 sm:text-sm">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const WE_SUPPLY = [
  'Switches & sockets', 'Lighting', 'Wires & cables', 'Circuit protection', 'Electrical accessories',
  'Electrical tools', 'Distribution & control',
];
const WE_DONT = ['Refrigerators & washing machines', 'TVs & home entertainment', 'Mobile phones & gadgets', 'General household goods'];

export function FocusSection() {
  return (
    <section className="border-y border-border bg-surface/30 py-12 sm:py-20 lg:py-24" aria-labelledby="focus-heading">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div {...reveal('soft')}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:mb-2 sm:text-sm">Our focus</p>
          <h2 id="focus-heading" className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            An electrical supplier, <span className="text-primary">not an appliance store</span>
          </h2>
          <p className="mt-4 text-muted">
            We specialise in the products that go <em>into</em> the walls, ceilings and panels of a building: the
            materials electricians install. That focus means deeper stock, better prices and advice you can trust.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div {...reveal()} className="card-glow rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h3 className="mb-4 font-semibold text-primary">We supply</h3>
            <ul className="space-y-2.5">
              {WE_SUPPLY.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-zinc-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          <div {...reveal()} className="card-glow rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 font-semibold text-muted">We don&apos;t sell</h3>
            <ul className="space-y-2.5">
              {WE_DONT.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-muted"><X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GalleryTeaser({ images }) {
  if (images.length < 3) return null;
  const label = (v) => GALLERY_CATEGORIES.find((c) => c.value === v)?.label ?? v;
  return (
    <section className="container-page py-12 sm:py-20 lg:py-24" aria-labelledby="gallery-heading">
      <SectionHeading
        id="gallery-heading"
        eyebrow="Gallery"
        title="Inside our store & projects"
        action={{ href: '/gallery', label: 'View gallery' }}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
        {images.slice(0, 5).map((img, i) => (
          <Link
            key={img.id}
            href="/gallery"
            {...reveal('zoom')}
            className={`group relative overflow-hidden rounded-lg border border-border ${i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
          >
            <Image src={img.url} alt={img.caption || label(img.category)} fill sizes={i === 0 ? '50vw' : '25vw'} className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
            <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{label(img.category)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="container-page pb-16 pt-4 sm:pb-24">
      <div {...reveal()} className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface to-surface p-6 sm:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Planning a project or restocking?</h2>
            <p className="mt-2 text-sm text-zinc-300 sm:mt-3 sm:text-base">Send us your list or BOQ and we&apos;ll reply with pricing, stock and delivery options.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink('Hello Meca Trade Link, I would like a quotation for my project.')}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ size: 'lg', className: 'bg-[#25D366] text-white shadow-none hover:bg-[#1ebe5a]' })}
            >
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
            </a>
            <ButtonLink href={site.contact.phoneHref} variant="outline" size="lg">
              <Phone className="h-5 w-5" aria-hidden /> {site.contact.phone}
            </ButtonLink>
          </div>
        </div>
        <p className="relative mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:mt-8 sm:text-sm">
          <Headset className="h-4 w-4 text-primary" aria-hidden /> Not sure what you need? Our team can recommend the right products.
          <Link href="/quote" className="ml-1 text-primary hover:underline">Or build a quote list →</Link>
        </p>
      </div>
    </section>
  );
}
