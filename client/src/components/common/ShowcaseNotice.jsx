import { MessageSquareText } from 'lucide-react';
import BrandMark from './BrandMark';
import WhatsAppIcon from './WhatsAppIcon';
import { ButtonLink, buttonClasses } from '@/components/ui/button';
import { whatsappLink } from '@/lib/site';
import { reveal } from '@/lib/motion';

/** Shown in place of accounts/admin when the site runs without an API (showcase mode). */
export default function ShowcaseNotice({ area = 'Customer accounts' }) {
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4 pb-16 pt-28">
      <div {...reveal('soft')} className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
        <BrandMark size={64} className="mx-auto mb-5 h-16 w-16" />
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{area} are coming soon</h1>
        <p className="mt-2 text-sm text-muted">
          You don&apos;t need an account to order. Browse the catalogue and send us an enquiry, and our team will reply with
          prices and availability.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href={whatsappLink('Hello Meca Trade Link, I have an enquiry.')}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ className: 'w-full bg-[#25D366] text-white shadow-none hover:bg-[#1ebe5a]' })}
          >
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <ButtonLink href="/contact" variant="outline" className="w-full">
            <MessageSquareText className="h-4 w-4" aria-hidden /> Contact us
          </ButtonLink>
          <ButtonLink href="/products" variant="ghost" className="w-full">Browse products</ButtonLink>
        </div>
      </div>
    </section>
  );
}
