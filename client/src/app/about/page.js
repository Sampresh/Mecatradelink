import {
  BadgeCheck, Building2, Handshake, HardHat, HeartHandshake, Home, Lightbulb, MapPin, PackageCheck, Scale, ShieldCheck, Store, Users, Warehouse,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { CtaBand, WhyChooseUs } from '@/components/home/HomeSections';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'About Us',
  description:
    'Meca Trade Link is an electrical products and materials supplier in Madhyapur Thimi, serving homes, shops, offices, builders and electrical contractors.',
  path: '/about',
});

// TODO(launch): set the year the business started (e.g. 2015) to show "Serving since …".
const ESTABLISHED = null;

const WHAT_WE_DO = [
  'Switches, sockets, plates and modular accessories',
  'LED bulbs, panel lights, downlights, spotlights and decorative lighting',
  'House wires, flexible and armoured cables',
  'MCBs, RCCBs and circuit protection',
  'Distribution boards and control gear',
  'Plugs, holders and installation accessories',
  'Electrical tools and testers',
];

const EXPERIENCE = [
  { icon: Home, title: 'Homes & renovations', text: 'Complete wiring, switch and lighting packages for new houses and upgrades.' },
  { icon: Store, title: 'Shops & offices', text: 'Efficient lighting and safe power distribution for commercial spaces.' },
  { icon: Building2, title: 'Buildings & projects', text: 'Bulk cable, distribution boards and protection supplied to site schedules.' },
  { icon: HardHat, title: 'Electrical contractors', text: 'Reliable repeat supply and quick quotes for electricians and installers.' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Genuine products only', text: 'We source from manufacturers and authorised distributors. No copies, no compromises on safety ratings.' },
  { icon: Scale, title: 'Honest, fair pricing', text: 'Clear quotes based on quantity and requirement, with competitive rates for contractors and bulk buyers.' },
  { icon: Handshake, title: 'Long-term relationships', text: 'Most of our customers come back. We earn that by being dependable on every order, big or small.' },
  { icon: Lightbulb, title: 'Practical advice', text: 'Not sure which cable size or breaker rating you need? We help you choose the right product the first time.' },
];

const COMMITMENTS = [
  { icon: BadgeCheck, text: 'Every product meets its stated rating and comes with the manufacturer’s warranty where applicable.' },
  { icon: PackageCheck, text: 'Orders are checked before dispatch so you get the right item, size and quantity.' },
  { icon: Warehouse, text: 'We keep fast-moving items in stock and source special items on request.' },
  { icon: HeartHandshake, text: 'Quick replies by phone, WhatsApp and email, and support after the sale.' },
];

function Section({ id, eyebrow, title, children, className = '' }) {
  return (
    <section aria-labelledby={id} className={`py-16 sm:py-20 ${className}`}>
      <div className="container-page">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h2 id={id} className="mb-8 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Your local partner for electrical supplies"
        description={`${site.name} supplies electrical products and materials to homes, shops, offices, buildings, contractors and electrical projects, from ${site.contact.shortAddress}.`}
        crumbs={[{ label: 'About' }]}
      />

      <Section id="who" eyebrow="Who we are" title="A dedicated electrical products supplier">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="prose-content">
            <p>
              {site.name} is an electrical trading business based in {site.contact.address}. We focus on one
              thing: the electrical products and installation materials that go into homes, businesses and
              buildings.
            </p>
            <p>
              We are an electrical supplier, not an appliance or electronics store. We don&apos;t sell
              refrigerators, TVs or mobile phones. That focus lets us keep deeper stock, offer better prices and
              give advice you can rely on.
            </p>
          </div>
          <div className="space-y-3 rounded-lg border border-border bg-surface p-6">
            <p className="flex items-center gap-2 text-sm text-zinc-300"><MapPin className="h-4 w-4 text-primary" aria-hidden /> {site.contact.address}</p>
            <p className="flex items-center gap-2 text-sm text-zinc-300"><Users className="h-4 w-4 text-primary" aria-hidden /> Serving homeowners, businesses &amp; contractors</p>
            {ESTABLISHED && (
              <p className="flex items-center gap-2 text-sm text-zinc-300"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden /> Serving customers since {ESTABLISHED}</p>
            )}
          </div>
        </div>
      </Section>

      <Section id="what" eyebrow="What we do" title="Everything for a safe, modern electrical installation" className="border-y border-border bg-surface/30">
        <p className="mb-6 max-w-3xl text-muted">
          We supply electrical products and materials, from a single replacement switch to complete project
          requirements. Our range includes:
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_WE_DO.map((t) => (
            <li key={t} className="flex gap-3 rounded-lg border border-border bg-background p-4 text-sm text-zinc-200">
              <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="experience" eyebrow="Our experience" title="Trusted on jobs of every size">
        <p className="mb-8 max-w-3xl text-muted">
          {ESTABLISHED ? `Since ${ESTABLISHED}, we have` : 'We have'} supplied electrical materials for household
          repairs, new homes, retail fit-outs, offices and multi-storey building projects. That experience means
          we understand what electricians need on site: the right specification, in the right quantity, on time.
        </p>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCE.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-background p-6">
              <Icon className="mb-4 h-7 w-7 text-primary" aria-hidden />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="values" eyebrow="Our business values" title="How we work" className="border-y border-border bg-surface/30">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-lg border border-border bg-background p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="commitment" eyebrow="Our commitment" title="Quality products, looked-after customers">
        <ul className="grid gap-4 md:grid-cols-2">
          {COMMITMENTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-zinc-200">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden /> {text}
            </li>
          ))}
        </ul>
      </Section>

      <WhyChooseUs />
      <CtaBand />
    </>
  );
}
