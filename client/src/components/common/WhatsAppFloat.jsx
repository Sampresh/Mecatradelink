'use client';

import { usePathname } from 'next/navigation';
import WhatsAppIcon from './WhatsAppIcon';
import { whatsappLink } from '@/lib/site';

// Floating chat button on public pages.
export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <a
      href={whatsappLink('Hello Meca Trade Link, I have an enquiry about electrical products.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3 text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:p-3.5"
    >
      <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden pr-1 text-sm font-semibold sm:group-hover:inline">Chat on WhatsApp</span>
    </a>
  );
}
