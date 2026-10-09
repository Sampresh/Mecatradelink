'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

// Public header/footer everywhere except the admin area, which has its own chrome.
export default function SiteShell({ footer, children }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return children;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <Header />
      <main id="main" className="min-h-[70vh]">{children}</main>
      {footer}
    </>
  );
}
