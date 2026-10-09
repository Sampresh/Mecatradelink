import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import ContactForm from '@/components/forms/ContactForm';
import { buildMetadata } from '@/lib/seo';
import { site, whatsappLink } from '@/lib/site';
import { reveal } from '@/lib/motion';

export const metadata = buildMetadata({
  title: 'Contact Us',
  description: `Call or WhatsApp ${site.contact.phone}, email ${site.contact.email}, or visit Meca Trade Link in Madhyapur Thimi for electrical products and bulk supply.`,
  path: '/contact',
});

const CHANNELS = [
  { icon: Phone, label: 'Call', value: site.contact.phone, href: site.contact.phoneHref, cta: 'Call now' },
  { icon: WhatsAppIcon, label: 'WhatsApp', value: site.contact.phone, href: whatsappLink('Hello Meca Trade Link, I have an enquiry.'), cta: 'Open chat', external: true, accent: 'text-[#25D366] bg-[#25D366]/10' },
  { icon: Mail, label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}`, cta: 'Send email' },
  { icon: MapPin, label: 'Visit', value: site.contact.address, href: site.contact.mapLink, cta: 'Get directions', external: true },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to our sales team"
        description="Ask about price, stock or bulk supply. Call, WhatsApp, email or send the form, and we'll reply quickly."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="container-page py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map(({ icon: Icon, label, value, href, cta, external, accent }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                {...reveal()}
                className="card-glow card-glow-fill group flex h-full flex-col rounded-lg border border-border bg-surface p-5"
              >
                <span className={`mb-4 grid h-11 w-11 place-items-center rounded-lg ${accent ?? 'bg-primary/10 text-primary'}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
                <span className="mt-0.5 break-words font-semibold">{value}</span>
                <span className="mt-auto flex items-center gap-1 pt-3 text-sm text-primary">
                  {cta} {external && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page grid gap-8 pb-16 lg:grid-cols-[1.4fr_1fr]">
        <div {...reveal()} className="rounded-lg border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-semibold">Send us a message</h2>
          <p className="mb-6 text-sm text-muted">Leave a phone number or email, whichever you prefer.</p>
          <ContactForm />
        </div>

        <div className="space-y-4">
          <div {...reveal('fade')} className="overflow-hidden rounded-lg border border-border">
            <iframe
              title={`Map: ${site.name}, ${site.contact.address}`}
              src={site.contact.mapEmbed}
              className="h-72 w-full grayscale-[30%] lg:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div {...reveal()} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" aria-hidden /> Business hours</h2>
            <dl className="space-y-2 text-sm">
              {site.contact.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-muted">{h.days}</dt>
                  <dd className="font-medium">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
