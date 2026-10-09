import { Mail } from 'lucide-react';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { buttonClasses } from '@/components/ui/button';

/** Showcase mode: the prepared enquiry is sent from the customer's own WhatsApp or email. */
export default function SendVia({ whatsapp, mailto, onSent }) {
  return (
    <div className="mt-5 flex w-full max-w-sm flex-col gap-2">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onSent}
        className={buttonClasses({ size: 'lg', className: 'w-full bg-[#25D366] text-white shadow-none hover:bg-[#1ebe5a]' })}
      >
        <WhatsAppIcon className="h-5 w-5" /> Send on WhatsApp
      </a>
      <a href={mailto} onClick={onSent} className={buttonClasses({ variant: 'outline', className: 'w-full' })}>
        <Mail className="h-4 w-4" aria-hidden /> Send by email instead
      </a>
    </div>
  );
}
